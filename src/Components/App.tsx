import React from 'react';
import {Map, Marker, TileLayer, Tooltip} from 'react-leaflet';
import {AlertManager, withAlert} from 'react-alert'
import API from "../API";

import Vehicle from "../Vehicle";
import Line from "../Line";
import VehicleTrack from "./VehicleTrack";

type AppProps = {
  alert: AlertManager
};
type AppState = {
  search: string,
  lines: Line[],
  vehicles: Vehicle[],
  selectedVehicle: Vehicle | false,
};

class App extends React.Component<AppProps, AppState> {
  // @ts-ignore
  private interval: NodeJS.Timeout;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      search: "",
      lines: [],
      vehicles: [],
      selectedVehicle: false
    }
    this.findVehicles = this.findVehicles.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidMount() {
    API.getRouteList().then(lines => {
      this.setState({lines});
    })
  }

  loadVehicles(r: string) {
    API.getVehicles(r)
      .then((vehicles: Vehicle[]) => {
        this.setState({vehicles});
      })
  }

  findVehicles(e: React.FormEvent) {
    clearInterval(this.interval);
    e.preventDefault();
    let r = this.state.lines.filter(line => line.name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1).map(d => d.name).join(",");
    if (r.length === 0) {
      this.props.alert.show("Podaj poprawny numer linii komunikacji miejskiej!");
      return;
    }
    this.interval = setInterval(() => this.loadVehicles(r), 10000);
    this.loadVehicles(r);
    return false;
  }


  render() {

    return (
      <div className="App">
        <div id="navigation">
          <form onSubmit={this.findVehicles}>
            <div className="input-container">
              <input type="text" required={true} value={this.state.search}
                     onChange={(e) => this.setState({search: e.target.value})}/>
              <label>Linia MPK (np. 58B)</label>
            </div>
            <button type="submit" className="btn">Wyszukaj!</button>
          </form>

        </div>
        <Map center={[51.77, 19.46]} zoom={12} id={"map"}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            tileSize={256}
            zIndex={-1}
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {this.state.vehicles.map(vehicle => (

            <Marker position={[vehicle.lon1, vehicle.lat1]} onClick={() => this.setState({selectedVehicle: vehicle})}
                    key={vehicle.id}>
              <Tooltip>
                {vehicle.name}
              </Tooltip>
            </Marker>

          ))}
          {this.state.selectedVehicle && <VehicleTrack lines={this.state.lines} vehicle={this.state.selectedVehicle}/>}
        </Map>
      </div>
    );
  }
}

export default withAlert()(App);
