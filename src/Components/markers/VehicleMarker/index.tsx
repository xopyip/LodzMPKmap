import { DivIcon } from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import React, { useCallback, useEffect, useState } from "react";
import "./style.scss";
import { Vehicle, VehicleTimeTable } from "../../../types";
import API from "../../../API";

/**
 * Convert previous and current vehicle position into direction angle
 * @param vehicle
 */
function calcDirection(vehicle: Vehicle) {
  const lat1 = (vehicle.lat2 * Math.PI) / 180;
  const lat2 = (vehicle.lat1 * Math.PI) / 180;
  const lon1 = (vehicle.lon2 * Math.PI) / 180;
  const lon2 = (vehicle.lon1 * Math.PI) / 180;
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return x === 0 && y === 0 ? NaN : (Math.atan2(y, x) * 180) / Math.PI;
}

type VehicleMarkerProps = {
  vehicle: Vehicle;
  setSelectedVehicle: (v: Vehicle) => void;
  isSelected: boolean;
};

export default function VehicleMarker({
  vehicle,
  isSelected,
  setSelectedVehicle,
}: VehicleMarkerProps) {
  const [timeTable, setTimeTable] = useState<false | VehicleTimeTable>(false);

  const dir = calcDirection(vehicle);

  const icon = new DivIcon({
    iconSize: [20, 20],
    html: `<div class="vehicle-marker" style="${
      !Number.isNaN(dir)
        ? `--rotate-arrow: ${dir}deg;`
        : "--display-arrow: none;"
    }"></div>`,
  });
  const [visibleStops, setVisibleStops] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (isSelected) {
      API.getVehicleTimeTable(vehicle.id).then(r => {
        if (isMounted) {
          setTimeTable(r);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [vehicle.id, vehicle.lon1, vehicle.lat1, isSelected]);

  useEffect(() => setVisibleStops(5), [isSelected]);

  const showMoreStops = useCallback(() => {
    setVisibleStops(visibleStops + 5);
  }, [visibleStops]);

  return (
    <Marker
      icon={icon}
      position={[vehicle.lat1, vehicle.lon1]}
      eventHandlers={{ click: () => setSelectedVehicle(vehicle) }}
    >
      <Tooltip>{vehicle.name}</Tooltip>
      <Popup className="vehicle-popup">
        <div className="vehicle-popup-header">
          <p>Linia: {vehicle.name}</p>
          {vehicle.timeToNextStation < 0 && (
            <p>Aktualne opóźnienie: {-vehicle.timeToNextStation}s</p>
          )}
        </div>
        <p>Kierunek: {vehicle.to}</p>
        {timeTable && <p>Do końca: {timeTable.stops.length} przystanków</p>}
        <ol className="vehicle-timetable">
          {timeTable &&
            timeTable.stops.slice(0, visibleStops).map(stop => (
              <li key={stop.stopID}>
                {stop.stopName} {stop.timeStr.replace("&lt;", "<")}
              </li>
            ))}
        </ol>
        {timeTable && timeTable.stops.length > visibleStops && (
          <button onClick={showMoreStops} type="button">
            Pokaż więcej
          </button>
        )}
      </Popup>
    </Marker>
  );
}
