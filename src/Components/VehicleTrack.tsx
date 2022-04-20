import React, {useCallback, useEffect, useState} from "react";
import API from "../API";
import {Polyline} from "react-leaflet";
import {Line, Track, Vehicle} from "../types";

type VehicleTrackProps = {
    vehicle: Vehicle,
    lines: Line[],

};

function VehicleTrack({vehicle, lines}: VehicleTrackProps) {
    const [polyline, setPolyline] = useState<[number, number][][]>([]);

    const getTrackIndices = useCallback((track: Track) => {
        if (track) {
            let directionsToEnd = track.directions.filter(direction => direction.name === vehicle.to);
            let directionsToStart = track.directions.filter(direction => direction.name === vehicle.from);
            let item = directionsToEnd.find(dir1 => directionsToStart.find(dir2 => dir1.from === dir2.to && dir1.to === dir2.from) !== undefined);

            if (item) return item.indices.forward;
            else {
                console.log("no direction found", {
                    dir: track.directions,
                    vehicle: vehicle
                });
            }
        }
        return [];
    }, [vehicle]);

    const update = useCallback(() => {
        setPolyline([]);
        let tracks = lines.filter(line => line.name === vehicle.name);
        if (tracks.length === 0) {
            console.log("track not found");
            return;
        }
        let track = tracks[0].id;
        API.getTracks(track).then(track => {
            let indices = getTrackIndices(track);
            let ret: ([number, number][])[] = [];
            indices.forEach((v, i) => {
                //get all pairs of indices
                if (i < indices.length - 1) {
                    //find path between two selected points
                    let f = (track.roads.filter(r => (r.from === indices[i] && r.to === indices[i + 1]) || (r.to === indices[i] && r.from === indices[i + 1])));
                    if (f.length > 0) {
                        if (ret.length > 0) {
                            //connect previous part with current
                            ret.push([
                                ret.reverse()[0].reverse()[0],
                                f[0].points[0],
                            ]);
                        }
                        //push new path part
                        ret.push(f[0].points);
                    }
                }
            })
            setPolyline(ret);
        });
    }, [setPolyline, lines, vehicle, getTrackIndices]);

    useEffect(() => {
        update();
    }, [update, vehicle]);

    return (
        <Polyline color={"red"} positions={polyline}/>
    );
}

export default VehicleTrack;
