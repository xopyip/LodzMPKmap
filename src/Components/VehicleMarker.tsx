import {DivIcon} from "leaflet";
import {Marker, Popup, Tooltip} from "react-leaflet";
import React, {useEffect, useState} from "react";
import './VehicleMarker.scss';
import {Vehicle, VehicleTimeTable} from "../types";
import API from "../API";


function calcDirection(vehicle: Vehicle) {
  let lat1 = vehicle.lat2 * Math.PI / 180;
  let lat2 = vehicle.lat1 * Math.PI / 180;
  let lon1 = vehicle.lon2 * Math.PI / 180;
  let lon2 = vehicle.lon1 * Math.PI / 180;
  let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return x === 0 && y === 0 ? NaN : Math.atan2(y, x) * 180 / Math.PI;
}


type VehicleMarkerProps = {
  vehicle: Vehicle,
  setSelectedVehicle: (v: Vehicle) => any;
  isSelected: boolean
};

export function VehicleMarker(props: VehicleMarkerProps) {
  let dir = calcDirection(props.vehicle);
  let icon = new DivIcon({
    iconSize: [20, 20],
    html: `<div class="vehicle-marker" style="${(!isNaN(dir) ? `--rotate-arrow: ${dir}deg;` : '--display-arrow: none;')}"></div>`
  });
  let [timeTable, setTimeTable] = useState<false | VehicleTimeTable>(false);
  useEffect(() => {
    if (props.isSelected)
      API.getVehicleTimeTable(props.vehicle.id).then(r => setTimeTable(r));
  }, [props.vehicle.id, props.vehicle.lon1, props.vehicle.lat1, props.isSelected]);
  return <Marker
    icon={icon}
    position={[props.vehicle.lat1, props.vehicle.lon1]}
    eventHandlers={{click: () => props.setSelectedVehicle(props.vehicle)}}>
    <Tooltip>
      {props.vehicle.name}
    </Tooltip>
    <Popup className={"vehicle-popup"}>
      <p>Linia: {props.vehicle.name}</p>
      <p>Kierunek: {props.vehicle.to}</p>
      <p>Do nastepnego przystanku: {props.vehicle.timeToNextStation}s</p>
      {timeTable && <p>Do końca: {timeTable.stops.length} przystanków</p>}
      <ol className={"vehicle-timetable"}>
        {timeTable && timeTable.stops.slice(0, 5).map(stop => (
          <li key={stop.stopID}>
            {stop.stopName} {stop.timeStr.replace("&lt;", "<")}
          </li>
        ))}
      </ol>
      {timeTable && timeTable.stops.length > 5 && <p>...</p>}
    </Popup>
  </Marker>
}