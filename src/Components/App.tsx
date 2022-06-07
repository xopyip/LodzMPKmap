import React, { useEffect, useState } from "react";
import { MapContainer } from "react-leaflet";
import { withAlert } from "react-alert";
import API from "../API";

import { Line } from "../types";
import { BusStopLayer } from "./layers/BusStopsLayer";
import { MapTileLayer } from "./layers/MapTileLayer";
import GPSMarker from "./markers/GPSMarker";
import VehiclesLayer from "./layers/VehiclesLayer";
import Navigation from "./navigation";

function App() {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentVehicles, setCurrentVehicles] = useState<string[]>([]);
  const [isTopographic, setIsTopographic] = useState(true);

  useEffect(() => {
    let mounted = true;
    API.getRouteList().then(lines => {
      if (mounted) {
        setLines(lines);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="App">
      <Navigation
        lines={lines}
        setCurrentVehicles={setCurrentVehicles}
        isTopographic={isTopographic}
        setIsTopographic={setIsTopographic}
      />
      <MapContainer center={[51.77, 19.46]} zoom={12} id="map">
        <MapTileLayer isTopographic={isTopographic} />
        <VehiclesLayer currentVehicles={currentVehicles} lines={lines} />
        <BusStopLayer />
        <GPSMarker />
      </MapContainer>
    </div>
  );
}

export default withAlert()(App);
