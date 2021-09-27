import axios from "axios";
import {Track, Vehicle, VehicleStop, VehicleTimeTable} from "./types";

const BASE_URL = "https://lodzmpk.pl/api/";

function decodeString(s: string): string {
  s = s.replace("&amp;", "&").replace(/&#([0-9]{1,3});/gi,
    (match, numStr) => String.fromCharCode(parseInt(numStr, 10)));
  if (s.indexOf("&amp;") > -1) {
    return decodeString(s);
  }
  return s;
}

const API = {
  get: async function (endpoint: string) {
    return await axios.get(BASE_URL + endpoint).then(response => response.data);
  },
  post: async function (endpoint: string, data: {}) {
    return await axios.post(BASE_URL + endpoint, data).then(response => response.data);
  },
  getRouteList() {
    return API.get("Home/GetRouteList").then(data => {
      data = data.flatMap((d: any) => d[1]);
      return Array.from(Array(data.length / 2), (_, i) => {
        return {
          id: data[i * 2],
          name: data[i * 2 + 1].trim(),
        }
      });
    });
  },
  getVehicles(r: string): Promise<Vehicle[]> {
    return API.post("Home/CNR_GetVehicles", {r}).then((data: string) => {
      let lines = data.split("\n")
      let r = /<p>(.*)<\/p>/;
      let vehicles = [];
      for (let line of lines) {
        let match = line.match(r);
        if (match) {
          let vehicle = (JSON.parse(match[1]));
          vehicles.push({
            lat1: vehicle[10],
            lon1: vehicle[9],
            lat2: vehicle[12],
            lon2: vehicle[11],
            name: vehicle[2].trim() || vehicle[19].trim(),
            timeToNextStation: vehicle[13],
            id: vehicle[0],
            to: decodeString(vehicle[25].trim()),
            from: decodeString(vehicle[26].trim())
          });
        }
      }
      return vehicles;
    });
  },

  getTracks: async function (track: number): Promise<Track> {
    return API.get(`Home/GetTracks?routeId=${track}`).then(data => (
      {
        stops: {
          id: data[0][0],
          name: data[0][1],
          lon: data[0][3],
          lat: data[0][4],
        },
        roads: data[1].map((d: any) => ({
          id: d[0],
          from: d[1],
          to: d[2],
          points: Array.from(Array(d[3].length / 2), (_, i) => ([d[3][i * 2 + 1], d[3][i * 2]]))
        })),
        indices: data[2].map((d: any) => ({forward: d[0], backward: d[1]})),
        directions: data[3].map((d: any) => ({
          name: d[3].trim(),
          to: d[5].trim(),
          from: d[4].trim(),
          indices: {
            forward: d[6][0],
            backward: d[6][1],
          },
        })),

      }
    ));
  },

  getVehicleTimeTable: async function (vehicle: number): Promise<VehicleTimeTable> {
    return API.post(`Home/CNR_GetVehicleTimeTable`, {n: vehicle}).then((data: string) => {
      let scheduleInfo = /<Schedules id="([0-9]+)" nr="([^"]+)" type="[0-9]+" o="([^"]+)" xmlns="">/.exec(data);
      let stops: VehicleStop[] = data.split('\n')
        .map(l => /<Stop lp="([0-9]+)" id="([0-9]+)" name="([^"]+)" th="" tm="([^"]+)" s="([0-9]+)" m="[0-9]+" \/>/.exec(l))
        .filter(stop => stop !== null)
        .map(stop => ({
          lp: Number(stop![1]),
          stopID: Number(stop![2]),
          stopName: stop![3],
          timeStr: stop![4],
          time: Number(stop![5])
        }));
      return {
        end: scheduleInfo![3],
        line: scheduleInfo![2],
        stops
      };
    });
  }

};

export default API;
export {decodeString};
