import {Marker, Popup, Tooltip, useMap, useMapEvents} from "react-leaflet";
import React, {useState} from "react";
import {BusStop} from "../types";
import {DivIcon} from "leaflet";


type BusStopMarkerProps = {
    busStop: BusStop
};

export function BusStopMarker({busStop}: BusStopMarkerProps) {
    const map = useMap()
    const [isVisible, setVisible] = useState(false);

    const icon = new DivIcon({
        iconSize: [20, 20],
        html: `<div class="bus-stop-marker"></div>`
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
