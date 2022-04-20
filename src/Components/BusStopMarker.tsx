import {Marker, Popup, Tooltip, useMap, useMapEvents} from "react-leaflet";
import React, {useState} from "react";
import {BusStop} from "../types";
import {DivIcon} from "leaflet";
import "./BusStopMarker.scss";


type BusStopMarkerProps = {
    busStop: BusStop
};

const regionColors: {[idx: number]: string} = {
    1: "#9728ff",
    2: "#28dfff",
    3: "#97ff28",
}

export function BusStopMarker({busStop}: BusStopMarkerProps) {
    const map = useMap()
    const [isVisible, setVisible] = useState(false);

    const icon = new DivIcon({
        iconSize: [20, 20],
        html: `<div class="bus-stop-marker" style="--bus-stop-color: ${regionColors[busStop.region] ?? 'blue'}"></div>`
    });

    useMapEvents({
        move: () => {
            setVisible(map.getBounds().contains([busStop.lat, busStop.lon]))
        }
    })
    return !isVisible ? <></> : <Marker
        icon={icon}
        position={[busStop.lat, busStop.lon]}>
        <Tooltip>
            {busStop.name}
        </Tooltip>
        <Popup className={"busstop-popup"}>
            <p>Przystanek: {busStop.name}</p>

        </Popup>
    </Marker>
}
