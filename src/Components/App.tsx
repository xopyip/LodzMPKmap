import React, { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useAlert, withAlert } from "react-alert";
import API from "../API";

import VehicleTrack from "./VehicleTrack";

import { VehicleMarker } from "./VehicleMarker";
import { BusStop, Line, Vehicle } from "../types";
import { BusStopMarker } from "./BusStopMarker";
import { ZoomFilter } from "./ZoomFilter";

function App() {
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | false>(
    false,
  );
  const [busStops, setBusStops] = useState<BusStop[]>([]);

  const alert = useAlert();

  const [currentVehicles, setCurrentVehicles] = useState("");

  const loadVehicles = useCallback(
    (r: string) => {
      API.getVehicles(r).then((vehicles: Vehicle[]) => {
        setVehicles(vehicles);
      });
    },
    [setVehicles],
  );

  const findVehicles = useCallback(
    (e: React.FormEvent) => {
      setCurrentVehicles("");
      e.preventDefault();
      const r = lines
        .filter(
          line => line.name.toLowerCase().indexOf(search.toLowerCase()) > -1,
        )
        .filter(line => {
          const exp = /[^0-9]*([0-9]+)[^0-9]*/;
          return (
            (exp.exec(line.name) ?? ["", NaN])[1] ===
            (exp.exec(search) ?? ["", NaN])[1]
          ); // NaN because NaN === NaN returns false
        })
        .map(d => d.name)
        .join(",");
      if (r.length === 0) {
        alert.show("Podaj poprawny numer linii komunikacji miejskiej!");
        return false;
      }
      setCurrentVehicles(r);
      return false;
    },
    [lines, search, alert, setCurrentVehicles],
  );

  useEffect(() => {
    let id: NodeJS.Timer;
    if (currentVehicles.length > 0) {
      id = setInterval(() => {
        loadVehicles(currentVehicles);
      }, 1000);
    }
    return () => id && clearInterval(id);
  }, [loadVehicles, currentVehicles]);

  useEffect(() => {
    // todo: dont change state if App is unmounted
    API.getRouteList().then(lines => {
      setLines(lines);
    });
    API.getBusStopList().then(setBusStops);
  }, []);

  return (
    <div className="App">
      <div id="navigation">
        <form onSubmit={findVehicles}>
          <div className="input-container">
            <input
              type="text"
              required
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="search-input"
            />
            <label htmlFor="search-input">Linia MPK (np. 58B)</label>
          </div>
          <button type="submit" className="btn">
            Wyszukaj!
          </button>
        </form>
      </div>
      <MapContainer center={[51.77, 19.46]} zoom={12} id="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          tileSize={256}
          zIndex={-1}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {vehicles.map(vehicle => (
          <VehicleMarker
            vehicle={vehicle}
            setSelectedVehicle={setSelectedVehicle}
            isSelected={selectedVehicle && vehicle.id === selectedVehicle.id}
            key={vehicle.id}
          />
        ))}
        <ZoomFilter minZoom={14} maxZoom={200}>
          {busStops.map(busStop => (
            <BusStopMarker busStop={busStop} key={busStop.id} />
          ))}
        </ZoomFilter>
        {selectedVehicle && (
          <VehicleTrack lines={lines} vehicle={selectedVehicle} />
        )}
      </MapContainer>
    </div>
  );
}

export default withAlert()(App);
