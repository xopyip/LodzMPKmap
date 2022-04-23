import { Marker } from "react-leaflet";
import React, { useCallback, useEffect, useState } from "react";
import { DivIcon } from "leaflet";
import "./style.scss";

export default function GPSMarker() {
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);

  const updateCurrentPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setCurrentPosition([position.coords.latitude, position.coords.longitude]);
    });
  }, []);

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
    html: `<div class="current-pos-marker"></div>`,
  });

  return currentPosition != null ? (
    <Marker icon={currentPosIcon} position={currentPosition} />
  ) : null;
}
