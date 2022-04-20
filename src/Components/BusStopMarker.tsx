import {Marker, Popup, Tooltip, useMap, useMapEvents} from "react-leaflet";
import React, {useState} from "react";
import {BusStop, BusStopTimeTable} from "../types";
import {DivIcon} from "leaflet";
import "./BusStopMarker.scss";
import API, {decodeString} from "../API";


type BusStopMarkerProps = {
    busStop: BusStop
};

const regionColors: { [idx: number]: string } = {
    1: "#9728ff",
    2: "#28dfff",
    3: "#97ff28",
}

export function BusStopMarker({busStop}: BusStopMarkerProps) {
    const map = useMap()
    const [isVisible, setVisible] = useState(false);
    const [busStopTimeTable, setBusStopTimeTable] = useState<BusStopTimeTable | null>(null);

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
        eventHandlers={{
            popupopen: () => {
                setBusStopTimeTable(null);
                API.getBusStopDepartures(busStop.id).then(setBusStopTimeTable)
            }
        }}
        position={[busStop.lat, busStop.lon]}>
        <Tooltip>
            {busStop.name}
        </Tooltip>
        <Popup className={"bus-stop-popup"}>
            <p>Przystanek: {busStop.name}</p>
            {busStopTimeTable == null ? (
                <div>Wczytywanie...</div>
            ) : (
                <ul>
                    {busStopTimeTable.departures.map(departure => (
                        <li>{departure.line}. {departure.name} - {decodeString(departure.time)}</li>
                    ))}
                </ul>
            )}
        </Popup>
    </Marker>
}
