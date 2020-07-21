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

function calcDirection(vehicle: Vehicle) {
  let lat1 = vehicle.lat2 * Math.PI / 180;
  let lat2 = vehicle.lat1 * Math.PI / 180;
  let lon1 = vehicle.lon2 * Math.PI / 180;
  let lon2 = vehicle.lon1 * Math.PI / 180;
  let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return x === 0 && y === 0 ? NaN : Math.atan2(y, x) * 180 / Math.PI;
}

export default Vehicle;
export {calcDirection};
