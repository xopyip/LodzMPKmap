import React, {useCallback, useEffect, useState} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import {useAlert, withAlert} from 'react-alert'
import API from "../API";

import VehicleTrack from "./VehicleTrack";

import {VehicleMarker} from "./VehicleMarker";
import {Line, Vehicle} from "../types";

function App() {
    const [search, setSearch] = useState("");
    const [lines, setLines] = useState<Line[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | false>(false);

    const alert = useAlert();

    const [currentVehicles, setCurrentVehicles] = useState("");

    const loadVehicles = useCallback((r: string) => {
        API.getVehicles(r)
            .then((vehicles: Vehicle[]) => {
                setVehicles(vehicles);
            })
    }, [setVehicles])

    const findVehicles = useCallback((e: React.FormEvent) => {
        setCurrentVehicles("");
        e.preventDefault();
        let r = lines.filter(line => line.name.toLowerCase().indexOf(search.toLowerCase()) > -1)
            .filter(line => {
                let exp = /[^0-9]*([0-9]+)[^0-9]*/;
                return (exp.exec(line.name) ?? ["", NaN])[1] === (exp.exec(search) ?? ["", NaN])[1]; //NaN because NaN === NaN returns false
            })
            .map(d => d.name).join(",");
        if (r.length === 0) {
            alert.show("Podaj poprawny numer linii komunikacji miejskiej!");
            return;
        }
        setCurrentVehicles(r);
        return false;
    }, [lines, search, alert, setCurrentVehicles])

    useEffect(() => {
        if (currentVehicles.length > 0) {
            const id = setInterval(() => {
                loadVehicles(currentVehicles);
            }, 1000);
            return () => clearInterval(id);
        } else {
            return () => {
            };
        }
    }, [loadVehicles, currentVehicles])

    useEffect(() => {
        API.getRouteList().then(lines => {
            setLines(lines);
        })
    }, []);

    return (
        <div className="App">
            <div id="navigation">
                <form onSubmit={findVehicles}>
                    <div className="input-container">
                        <input type="text" required={true} value={search}
                               onChange={(e) => setSearch(e.target.value)}/>
                        <label>Linia MPK (np. 58B)</label>
                    </div>
                    <button type="submit" className="btn">Wyszukaj!</button>
                </form>

            </div>
            <MapContainer center={[51.77, 19.46]} zoom={12} id={"map"}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    tileSize={256}
                    zIndex={-1}
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {vehicles.map(vehicle => (
                    <VehicleMarker vehicle={vehicle}
                                   setSelectedVehicle={setSelectedVehicle}
                                   isSelected={selectedVehicle && vehicle.id === selectedVehicle.id}
                                   key={vehicle.id}/>

                ))}
                {selectedVehicle && <VehicleTrack lines={lines} vehicle={selectedVehicle}/>}
            </MapContainer>
        </div>
    );
}

export default withAlert()(App);
