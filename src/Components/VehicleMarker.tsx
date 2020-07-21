import {DivIcon} from "leaflet";
import {Marker, Tooltip} from "react-leaflet";
import React from "react";
import Vehicle, {calcDirection} from "../Vehicle";
import './VehicleMarker.scss';

type VehicleMarkerProps = {
  vehicle: Vehicle,
  setSelectedVehicle: (v: Vehicle) => any;
};

export function VehicleMarker(props: VehicleMarkerProps) {
  let dir = calcDirection(props.vehicle);
  let icon = new DivIcon({
    iconSize: [20, 20],
    html: `<div class="vehicle-marker" style="${(!isNaN(dir) ? `--rotate-arrow: ${dir}deg;` : '--display-arrow: none;')}"></div>`
  });
  return <Marker
    icon={icon}
    position={[props.vehicle.lat1, props.vehicle.lon1]}
    eventHandlers={{click: () => props.setSelectedVehicle(props.vehicle)}}>
    <Tooltip>
      {props.vehicle.name}
    </Tooltip>
  </Marker>
}