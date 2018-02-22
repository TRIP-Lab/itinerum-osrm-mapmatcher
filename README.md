## Setting up multi-profile OSRM engines with Docker and NGINX


### Get base OSM data extract
1. `mkdir ~/osrm && cd ~/osrm`
2. `wget http://download.geofabrik.de/north-america/canada/quebec-latest.osm.bz2`


### Run car routing engine
1. `docker run -t -v $(pwd):/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/quebec-latest.osm.pbf`
2. `mkdir ~/osrm/car && mv quebec-latest.osrm* car/`
3. `docker run -t -v $(pwd)/car:/data osrm/osrm-backend osrm-partition /data/quebec-latest.osrm`
4. `docker run -t -v $(pwd)/car:/data osrm/osrm-backend osrm-customize /data/quebec-latest.osrm`
5. _Debugging:_ `docker run -d -p 5000:5000 -v $(pwd)/car:/data osrm/osrm-backend osrm-routed --algorithm MLD /data/quebec-latest.osrm`


### Run bicycle routing engine
1. `docker run -t -v $(pwd):/data osrm/osrm-backend osrm-extract -p /opt/bicycle.lua /data/quebec-latest.osm.pbf`
2. `mkdir ~/osrm/bicycle && mv quebec-latest.osrm* bicycle/`
3. `docker run -t -v $(pwd)/bicycle:/data osrm/osrm-backend osrm-partition /data/quebec-latest.osrm`
4. `docker run -t -v $(pwd)/bicycle:/data osrm/osrm-backend osrm-customize /data/quebec-latest.osrm`
5. _Debugging:_ `docker run -d -p 5001:5000 -v $(pwd)/bicycle:/data osrm/osrm-backend osrm-routed --algorithm MLD /data/quebec-latest.osrm`


### Run foot routing engine
1. `docker run -t -v $(pwd):/data osrm/osrm-backend osrm-extract -p /opt/foot.lua /data/quebec-latest.osm.pbf`
2. `mkdir ~/osrm/foot && mv quebec-latest.osrm* foot/`
3. `docker run -t -v $(pwd)/foot:/data osrm/osrm-backend osrm-partition /data/quebec-latest.osrm`
4. `docker run -t -v $(pwd)/foot:/data osrm/osrm-backend osrm-customize /data/quebec-latest.osrm`
5. _Debugging:_ `docker run -d -p 5002:5000 -v $(pwd)/foot:/data osrm/osrm-backend osrm-routed --algorithm MLD /data/quebec-latest.osrm`



### Installing Node bindings for OS X with homebrew
1. `brew install boost git cmake libzip libstxxl libxml2 lua tbb ccache`
2. `cd ~/osrm-backend`
3. `npm install --build-from-source`

Use as an import:
- `import OSRM from "~/osrm-backend/lib"`
