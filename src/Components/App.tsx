import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useAlert, withAlert } from "react-alert";
import { TileLayer as LeafletTileLayer } from "leaflet";
import API from "../API";

import VehicleTrack from "./VehicleTrack";

import { VehicleMarker } from "./VehicleMarker";
import { Line, Vehicle } from "../types";
import { BusStopLayer } from "./BusStopsLayer";

function App() {
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | false>(
    false,
  );

  const [isTopographic, setIsTopographic] = useState(true);

  const alert = useAlert();
  const tileLayerRef = useRef<LeafletTileLayer>(null);
  const topographicURL =
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
  const topographicAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';
  const nonTopographicURL =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const nonTopographicAttribution =
    "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012";
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(
        isTopographic ? topographicURL : nonTopographicURL,
      );
    }
  }, [isTopographic]);

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
          url={isTopographic ? topographicURL : nonTopographicURL}
          tileSize={256}
          zIndex={-1}
          ref={tileLayerRef}
          attribution={`${topographicAttribution} / and / ${nonTopographicAttribution}`}
        />
        {vehicles.map(vehicle => (
          <VehicleMarker
            vehicle={vehicle}
            setSelectedVehicle={setSelectedVehicle}
            isSelected={selectedVehicle && vehicle.id === selectedVehicle.id}
            key={vehicle.id}
          />
        ))}
        <BusStopLayer />
        {selectedVehicle && (
          <VehicleTrack lines={lines} vehicle={selectedVehicle} />
        )}
      </MapContainer>
      <button
        aria-label="Tryb wyświetlania mapy"
        id="change-map-style"
        onClick={() => setIsTopographic(!isTopographic)}
        value="Tryb wyświetlania mapy"
        type="button"
        className={isTopographic ? "" : "non-topographic"}
      />
    </div>
  );
}

export default withAlert()(App);
