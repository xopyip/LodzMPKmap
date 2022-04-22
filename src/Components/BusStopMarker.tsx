import { Marker, Popup, Tooltip } from "react-leaflet";
import React, { useState } from "react";
import { DivIcon } from "leaflet";
import { BusStop, BusStopTimeTable } from "../types";
import "./BusStopMarker.scss";
import API from "../API";

type BusStopMarkerProps = {
  busStop: BusStop;
};

const regionColors: { [idx: number]: string } = {
  1: "#9728ff",
  2: "#28dfff",
  3: "#97ff28",
};

export function BusStopMarker({ busStop }: BusStopMarkerProps) {
  const [busStopTimeTable, setBusStopTimeTable] =
    useState<BusStopTimeTable | null>(null);

  const icon = new DivIcon({
    iconSize: [10, 10],
    html: `<div class="bus-stop-marker" style="--bus-stop-color: ${
      regionColors[busStop.region] ?? "blue"
    }"></div>`,
  });

  return (
    <Marker
      icon={icon}
      eventHandlers={{
        popupopen: () => {
          setBusStopTimeTable(null);
          API.getBusStopDepartures(busStop.id).then(setBusStopTimeTable);
        },
      }}
      position={[busStop.lat, busStop.lon]}
    >
      <Tooltip>{busStop.name}</Tooltip>
      <Popup className="bus-stop-popup">
        <p>Przystanek: {busStop.name}</p>
        {busStopTimeTable == null ? (
          <div>Wczytywanie...</div>
        ) : (
          <ul>
            {busStopTimeTable.departures.map(departure => (
              <li key={departure.line + departure.time}>
                {departure.line}. {departure.name} -{" "}
                {API.decodeString(departure.time)}
              </li>
            ))}
          </ul>
        )}
      </Popup>
    </Marker>
  );
}
