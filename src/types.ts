export type VehicleStop = {
  lp: number;
  stopID: number;
  stopName: string;
  timeStr: string;
  time: number;
};

export type VehicleTimeTable = {
  end: string;
  line: string;
  stops: VehicleStop[];
};

export type Track = {
  stops: { id: number; name: string; lon: number; lat: number };
  roads: { id: number; from: number; to: number; points: [number, number][] }[];
  indices: { forward: number[]; backward: number[] }[];
  directions: {
    name: string;
    to: string;
    from: string;
    indices: { forward: number[]; backward: number[] };
  }[];
};

export type Line = {
  id: number;
  name: string;
};

export type Vehicle = {
  lon1: number;
  lat1: number;
  lon2: number;
  lat2: number;
  timeToNextStation: number; // in seconds
  name: string;
  id: number;
  to: string;
  from: string;
};
export type BusStopAPIData = [
  number,
  string,
  string,
  number,
  number,
  number,
  number,
  (string | number)[][],
];
export type BusStop = {
  id: number;
  name: string;
  region: number;
  lon: number;
  lat: number;
};
export type BusStopTimeTable = {
  departures: {
    line: string;
    time: string;
    name: string;
  }[];
};
