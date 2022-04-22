import { Marker, Tooltip } from "react-leaflet";
import React, { useMemo } from "react";
import { DivIcon } from "leaflet";
import "./ClusterMarker.scss";

type ClusterMarkerProps = {
  count: number;
  lat: number;
  lon: number;
};

export function ClusterMarker({ count, lat, lon }: ClusterMarkerProps) {
  const icon = useMemo(
    () =>
      new DivIcon({
        iconSize: [30, 30],
        html: `<div class="cluster-marker">${count}</div>`,
      }),
    [count],
  );

  return (
    <Marker icon={icon} position={[lat, lon]}>
      <Tooltip>Ilość przystanków: {count}</Tooltip>
    </Marker>
  );
}
