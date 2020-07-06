import axios from "axios";
import Vehicle from "./Vehicle";
import Track from "./Track";

const BASE_URL = "https://lodz.mateuszbaluch.tech/api/";

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
            lon1: vehicle[10],
            lat1: vehicle[9],
            lon2: vehicle[12],
            lat2: vehicle[11],
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
        stops: data[0],
        roads: data[1].map((d: any) => ({
          id: d[0],
          from: d[1],
          to: d[2],
          points: Array.from(Array(d[3].length / 2), (_, i) => ([d[3][i * 2 + 1], d[3][i * 2]]))
        })),
        indices: data[2].map((d: any) => ({forward: d[0], backward: d[1]})),
        directions: data[3].map((d: any) => {
          return ({
            to: d[3].trim(),
            from: d[4].trim().replaceAll("-", " ").toUpperCase(),
            indices: {
              forward: d[6][0],
              backward: d[6][1],
            },
          });
        }),

      }
    ));
  }
};

export default API;