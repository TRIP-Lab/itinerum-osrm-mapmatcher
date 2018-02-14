const express = require('express')
const { Pool } = require('pg')
// Expects NodeJS module to be compiled by source in sibling directory
const OSRM = require('../../osrm-backend/lib')


// Globals
const router = express.Router()
const pgConnectionString = process.env.IT_POSTGRES_URI_PLACEHOLDER || 'postgres://user:password@localhost:5432/itinerum'

const OSRMNetworkCar = new OSRM({path: '/home/trip/osrm/car/quebec-latest.osrm', algorithm: 'MLD'})
const OSRMNetworkBicycle = new OSRM({path: '/home/trip/osrm/bicycle/quebec-latest.osrm', algorithm: 'MLD'})
const OSRMNetworkFoot = new OSRM({path: '/home/trip/osrm/foot/quebec-latest.osrm', algorithm: 'MLD'})


// Setup the PostgreSQL client connection pool
const pool = new Pool({connectionString: pgConnectionString})

pool.on('error', (err, client) => {
	console.error('Unexpected error on idle client', err)
	process.exit(-1)
})


function getUserPoints(uuid, startTime, endTime) {
	const data = {complete: false}

	pool.connect((err, client, done) => {
		if (err) {
			done()
			console.log(err)
			return res.status(500).json({success: false, data: err})			
		}

		let sql = `SELECT *
			   FROM mobile_coordinates
			   JOIN mobile_users ON mobile_coordinates.mobile_id = mobile_users.id
			   WHERE mobile_users.uuid = $1
			   AND mobile_coordinates.timestamp >= $2
			   AND mobile_coordinates.timestamp <= $3
			   ORDER BY mobile_coordinates.timestamp ASC`
		let sql_parameters = [uuid, startTime, endTime]

		const query = client.query(sql, sql_parameters, (err, res) => {
			done()

			if (err) {
				console.log(err.stack)
			} else {
				processPoints(res.rows)
			}
		})
	})
}


function processPoints(rows) {
	const coordinates = [],
		  radiuses = [],
		  timestamps = []
	for (let point of rows) {
		coordinates.push([Number(point.longitude), Number(point.latitude)])
		radiuses.push(point.h_accuracy)
		timestamps.push(point.timestamp.getTime() / 1000)
	}

	runMapMatching(coordinates, radiuses, timestamps)
}


function runMapMatching(coordinates, radiuses, timestamps) {
	OSRMNetworkCar.match({coordinates, radiuses, timestamps}, function(err, response) {
		if (err) throw err
		console.log(1)
	})

	OSRMNetworkBicycle.match({coordinates, radiuses, timestamps}, function(err, response) {
		if (err) throw err
		console.log(2)
	})

	OSRMNetworkFoot.match({coordinates, radiuses, timestamps}, function(err, response) {
		if (err) throw err
		console.log(3)
	})		
}


/* GET users listing. */
router.get('/', function(req, res, next) {
	getUserPoints(req.query.uuid, req.query.start, req.query.end)

	res.send('map matcher route.')
});

module.exports = router
