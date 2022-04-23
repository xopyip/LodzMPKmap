import { TileLayer } from "react-leaflet";
import React, { useEffect, useRef, useState } from "react";
import { TileLayer as LeafletTileLayer } from "leaflet";

const topographicURL = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
const topographicAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';
const nonTopographicURL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const nonTopographicAttribution =
  "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012";

export function MapTileLayer() {
  const [isTopographic, setIsTopographic] = useState(true);
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current!.setUrl(
        isTopographic ? topographicURL : nonTopographicURL,
      );
    }
  }, [isTopographic]);

  return (
    <>
      <TileLayer
        url={isTopographic ? topographicURL : nonTopographicURL}
        tileSize={256}
        zIndex={-1}
        ref={tileLayerRef}
        attribution={`${topographicAttribution} / and / ${nonTopographicAttribution}`}
      />
      <button
        aria-label="Tryb wyświetlania mapy"
        id="change-map-style"
        onClick={() => setIsTopographic(!isTopographic)}
        value="Tryb wyświetlania mapy"
        type="button"
        className={isTopographic ? "" : "non-topographic"}
      />
    </>
  );
}
