import { Marker, useMap } from "react-leaflet";
import React, { useCallback, useEffect, useState } from "react";
import { DivIcon } from "leaflet";
import "./style.scss";

export default function GPSMarker() {
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);
  const [firstUpdate, setFirstUpdate] = useState(true);
  const map = useMap();

  const updateCurrentPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setCurrentPosition([position.coords.latitude, position.coords.longitude]);
      if (firstUpdate) {
        setTimeout(() => {
          map.setZoomAround(
            [position.coords.latitude, position.coords.longitude],
            20,
            { animate: true },
          );
        }, 1000);
        setFirstUpdate(false);
      }
    });
  }, [firstUpdate, map]);

  useEffect(() => {
    let interval: NodeJS.Timer | null = null;
    updateCurrentPosition();
    if ("geolocation" in navigator) {
      interval = setInterval(() => {
        updateCurrentPosition();
      }, 10000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [updateCurrentPosition]);

  const currentPosIcon = new DivIcon({
    iconSize: [35, 35],
    html: `<div class="gps-marker"></div>`,
  });

  return currentPosition != null ? (
    <Marker icon={currentPosIcon} position={currentPosition} />
  ) : null;
}
