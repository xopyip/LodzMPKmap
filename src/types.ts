type VehicleStop = {
  lp: number,
  stopID: number,
  stopName: string,
  timeStr: string,
  time: number,
};

type VehicleTimeTable = {
  end: string,
  line: string,
  stops: VehicleStop[]
};
type Track = {
  stops: { id: number, name: string, lon: number, lat: number },
  roads: { id: number, from: number, to: number, points: [number, number][] }[]
  indices: { forward: number[], backward: number[] }[],
  directions: {
    name: string,
    to: string,
    from: string,
    indices: { forward: number[], backward: number[] },
  }[]
};

type Line = {
  id: number,
  name: string
};

type Vehicle = {
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  timeToNextStation: number, //in seconds
  name: string,
  id: number,
  to: string,
  from: string
};

export type {VehicleStop, VehicleTimeTable, Track, Line, Vehicle};