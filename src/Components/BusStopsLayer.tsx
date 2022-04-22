import useSupercluster from "use-supercluster";
import React, { useEffect, useState } from "react";
import { useMapEvents, useMap } from "react-leaflet";
import { BusStop } from "../types";
import API from "../API";
import { BusStopMarker } from "./BusStopMarker";
import { ClusterMarker } from "./ClusterMarker";

export function BusStopLayer() {
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [zoom, setZoom] = useState(12);
  const [bounds, setBounds] = useState<[number, number, number, number]>([
    0, 0, 0, 0,
  ]);
  const { clusters } = useSupercluster({
    points: busStops.map(item => ({
      type: "Feature",
      properties: {
        cluster: false,
        data: item,
      },
      geometry: {
        type: "Point",
        coordinates: [item.lon, item.lat],
      },
    })),
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 17 },
  });

  useEffect(() => {
    // todo: dont change state if App is unmounted
    API.getBusStopList().then(setBusStops);
  }, []);

  const map = useMap();

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
    moveend: () => {
      setBounds([
        map.getBounds().getWest(),
        map.getBounds().getSouth(),
        map.getBounds().getEast(),
        map.getBounds().getNorth(),
      ]);
    },
  });
  return (
    <>
      {clusters.map(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } =
          cluster.properties;
        return isCluster ? (
          <ClusterMarker
            count={pointCount}
            lat={latitude}
            lon={longitude}
            key={cluster.id}
          />
        ) : (
          <BusStopMarker
            busStop={cluster.properties.data}
            key={cluster.properties.data.id}
          />
        );
      })}
    </>
  );
}
