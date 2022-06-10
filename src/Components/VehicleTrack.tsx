import React, { useCallback, useEffect, useState } from "react";
import { Polyline } from "react-leaflet";
import API from "../API";
import { Line, Track, Vehicle } from "../types";

type VehicleTrackProps = {
  vehicle: Vehicle;
  lines: Line[];
};

function VehicleTrack({ vehicle, lines }: VehicleTrackProps) {
  const [polyline, setPolyline] = useState<[number, number][][]>([]);

  const getTrackIndices = useCallback(
    async (track: Track) => {
      const timeTable = await API.getVehicleTimeTable(vehicle.id);
      if (!track || !timeTable) {
        return [];
      }
      const departures = await API.getNextDepartures(timeTable.stops[0].stopID);
      const vehicleDeparture = departures.find(d => d.n === vehicle.id);
      const selectedTrack = track.directions.find(
        d => d.id === vehicleDeparture?.di,
      );
      if (!selectedTrack) {
        return [];
      }
      return selectedTrack.indices.forward;
    },
    [vehicle],
  );

  const update = useCallback(async () => {
    setPolyline([]);
    const tracks = lines.filter(line => line.name === vehicle.name);
    if (tracks.length === 0) {
      console.log("track not found");
      return;
    }
    const track = await API.getTracks(tracks[0].id);

    const indices = await getTrackIndices(track);
    const ret: [number, number][][] = [];
    indices.forEach((v, i) => {
      // get all pairs of indices
      if (i < indices.length - 1) {
        // find path between two selected points
        const f = track.roads.filter(
          r =>
            (r.from === indices[i] && r.to === indices[i + 1]) ||
            (r.to === indices[i] && r.from === indices[i + 1]),
        );
        if (f.length > 0) {
          if (ret.length > 0) {
            // connect previous part with current
            ret.push([ret.reverse()[0].reverse()[0], f[0].points[0]]);
          }
          // push new path part
          ret.push(f[0].points);
        }
      }
    });
    setPolyline(ret);
  }, [setPolyline, lines, vehicle, getTrackIndices]);

  useEffect(() => {
    update();
  }, [update, vehicle]);

  return <Polyline color="red" positions={polyline} />;
}

export default VehicleTrack;
