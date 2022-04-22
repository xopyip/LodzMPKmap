import { Marker, Popup, Tooltip } from "react-leaflet";
import React, { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState<boolean>(false);

  const [updateTimeTableInterval, setUpdateTimeTableInterval] =
    useState<NodeJS.Timer | null>(null);
  const icon = new DivIcon({
    iconSize: [10, 10],
    html: `<div class="bus-stop-marker" style="--bus-stop-color: ${
      regionColors[busStop.region] ?? "blue"
    }"></div>`,
  });

  const updateTimeTable = useCallback(() => {
    setLoading(true);
    API.getBusStopDepartures(busStop.id).then(data => {
      setBusStopTimeTable(data);
      setLoading(false);
    });
  }, [setBusStopTimeTable, setLoading, busStop]);

  const stopUpdates = useCallback(() => {
    if (updateTimeTableInterval) {
      clearInterval(updateTimeTableInterval);
    }
  }, [updateTimeTableInterval]);

  useEffect(() => {
    return () => stopUpdates();
  }, [stopUpdates]);

  return (
    <Marker
      icon={icon}
      eventHandlers={{
        popupopen: () => {
          setBusStopTimeTable(null);
          updateTimeTable();
          setUpdateTimeTableInterval(setInterval(updateTimeTable, 10000));
        },
        popupclose: stopUpdates,
      }}
      position={[busStop.lat, busStop.lon]}
    >
      <Tooltip>{busStop.name}</Tooltip>
      <Popup className="bus-stop-popup">
        <p>Przystanek: {busStop.name}</p>
        {busStopTimeTable == null || (loading && <div>Wczytywanie...</div>)}
        {busStopTimeTable != null && (
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
