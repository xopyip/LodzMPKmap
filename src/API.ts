import axios from "axios";
import he from "he";
import {
  BusStop,
  BusStopAPIData,
  BusStopTimeTable,
  Line,
  Track,
  Vehicle,
  VehicleStop,
  VehicleTimeTable,
} from "./types";

const BASE_URL = "https://lodzmpk.pl/api/";

const API = {
  decodeString: (s: string) => {
    return he
      .decode(s)
      .replace("&amp;", "&")
      .replace(/&#([0-9]{1,3});/gi, (match, numStr) =>
        String.fromCharCode(parseInt(numStr, 10)),
      );
  },
  get(endpoint: string) {
    return axios.get(BASE_URL + endpoint).then(response => response.data);
  },
  post(endpoint: string, data: Record<string, unknown>) {
    return axios
      .post(BASE_URL + endpoint, data)
      .then(response => response.data);
  },
  getRouteList(): Promise<Line[]> {
    return API.get("Home/GetRouteList")
      .then(data => data.flatMap((d: (number | string)[]) => d[1]))
      .then(data =>
        Array.from(Array(data.length / 2), (_, i) => ({
          id: data[i * 2],
          name: data[i * 2 + 1].trim(),
        })),
      );
  },
  getVehicles(r: string): Promise<Vehicle[]> {
    return API.post("Home/CNR_GetVehicles", { r }).then((data: string) => {
      const lines = data.split("\n");
      const r = /<p>(.*)<\/p>/;
      const vehicles: Vehicle[] = [];
      lines.forEach(line => {
        const match = line.match(r);
        if (match) {
          const vehicle = JSON.parse(match[1]);
          vehicles.push({
            lat1: vehicle[10],
            lon1: vehicle[9],
            lat2: vehicle[12],
            lon2: vehicle[11],
            name: vehicle[2].trim() || vehicle[19].trim(),
            timeToNextStation: vehicle[13],
            id: vehicle[0],
            to: API.decodeString(vehicle[25].trim()),
            from: API.decodeString(vehicle[26].trim()),
          });
        }
      });
      return vehicles;
    });
  },

  async getTracks(track: number): Promise<Track> {
    return API.get(`Home/GetTracks?routeId=${track}`).then(data => {
      console.log(data);
      const stops = data[0] as [
        number,
        string,
        string,
        number,
        number,
        number,
      ][];

      return {
        stops: stops.map(el => ({
          name: el[1],
          id: el[0],
        })),
        roads: data[1].map((d: (number | number[])[]) => {
          const [id, from, to, points] = d as [
            number,
            number,
            number,
            number[],
          ];
          return {
            id,
            from,
            to,
            points: Array.from(Array(points.length / 2), (_, i) => [
              points[i * 2 + 1],
              points[i * 2],
            ]),
          };
        }),
        indices: data[2].map((d: number[][]) => ({
          forward: d[0],
          backward: d[1],
        })),
        directions: data[3].map((d: (string | number[][])[]) => {
          const [id, , , name, from, to, indices] = d as [
            string,
            string,
            string,
            string,
            string,
            string,
            number[][],
          ];
          return {
            id,
            name: name.trim(),
            to: to.trim(),
            from: from.trim(),
            indices: {
              forward: indices[0],
              backward: indices[1],
            },
          };
        }),
      };
    });
  },

  async getBusStopList(): Promise<BusStop[]> {
    return API.post("Home/GetMapBusStopList", {}).then(
      (data: BusStopAPIData[]) => {
        return data.map(data => {
          const [id, name, , region, lon, lat] = data;
          return {
            id,
            name,
            region,
            lon,
            lat,
          };
        });
      },
    );
  },

  async getBusStopDepartures(busStopId: number): Promise<BusStopTimeTable> {
    return API.get(`Home/GetTimetableReal?busStopId=${busStopId}`).then(
      (data: string) => {
        console.log(data);
        return {
          departures: data
            .split("</R>")
            .map(line =>
              /<R nr="(.*?)" dir="(.*?)".*?>.*?t="(.*?)"/gm.exec(
                line.replaceAll("\r\n", ""),
              ),
            )
            .filter(rd => rd !== null && rd.length >= 4)
            .map(rd => ({
              line: rd![1],
              name: rd![2],
              time: rd![3],
            })),
        };
      },
    );
  },

  async getVehicleTimeTable(vehicle: number): Promise<VehicleTimeTable> {
    return API.post(`Home/CNR_GetVehicleTimeTable`, { n: vehicle }).then(
      (data: string) => {
        const scheduleInfo =
          /<Schedules id="([0-9]+)" nr="([^"]+)" type="[0-9]+" o="([^"]+)" xmlns="">/.exec(
            data,
          );
        const stops: VehicleStop[] = data
          .split("\n")
          .map(l =>
            /<Stop lp="([0-9]+)" id="([0-9]+)" name="([^"]+)" th="" tm="([^"]+)" s="([0-9]+)" m="[0-9]+" \/>/.exec(
              l,
            ),
          )
          .filter(stop => stop !== null)
          .map(stop => ({
            lp: Number(stop![1]),
            stopID: Number(stop![2]),
            stopName: stop![3],
            timeStr: stop![4],
            time: Number(stop![5]),
          }));
        return {
          end: scheduleInfo![3],
          line: scheduleInfo![2],
          stops,
        };
      },
    );
  },

  async getNextDepartures(
    busStopId: number,
  ): Promise<{ di: number; i: number; n: number }[]> {
    return API.post(`Home/GetNextDepartues`, { busStopId }).then(
      (data: string) => {
        return data
          .split("\n")
          .map(l => /<D i="(\d+)" di="(\d+)" n="(\d+)" .* \/>/.exec(l))
          .filter(stop => stop !== null)
          .map(stop => ({
            i: Number(stop![1]),
            di: Number(stop![2]),
            n: Number(stop![3]),
          }));
      },
    );
  },
};

export default API;
