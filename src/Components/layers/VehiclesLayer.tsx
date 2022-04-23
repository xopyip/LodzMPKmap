import React, { useCallback, useEffect, useState } from "react";
import VehicleMarker from "../markers/VehicleMarker";
import { Line, Vehicle } from "../../types";
import API from "../../API";
import VehicleTrack from "../VehicleTrack";

type VehiclesLayerProps = {
  currentVehicles: string;
  lines: Line[];
};

export default function VehiclesLayer({
  currentVehicles,
  lines,
}: VehiclesLayerProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | false>(
    false,
  );

  const loadVehicles = useCallback(
    (r: string) => {
      API.getVehicles(r).then((vehicles: Vehicle[]) => {
        setVehicles(vehicles);
      });
    },
    [setVehicles],
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

  return (
    <>
      {vehicles.map(vehicle => (
        <VehicleMarker
          vehicle={vehicle}
          setSelectedVehicle={setSelectedVehicle}
          isSelected={selectedVehicle && vehicle.id === selectedVehicle.id}
          key={vehicle.id}
        />
      ))}

      {selectedVehicle && (
        <VehicleTrack lines={lines} vehicle={selectedVehicle} />
      )}
    </>
  );
}
