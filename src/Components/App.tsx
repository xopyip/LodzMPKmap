import React from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import {AlertContainer, withAlert} from 'react-alert'
import API from "../API";

import VehicleTrack from "./VehicleTrack";

import {VehicleMarker} from "./VehicleMarker";
import {Line, Vehicle} from "../types";

type AppProps = {
  alert: AlertContainer
};
type AppState = {
  search: string,
  lines: Line[],
  vehicles: Vehicle[],
  selectedVehicle: Vehicle | false
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
    let r = this.state.lines
      .filter(line => line.name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1)
      .filter(line => {
        let exp = /[^0-9]*([0-9]+)[^0-9]*/;
        return (exp.exec(line.name) ?? ["", NaN])[1] === (exp.exec(this.state.search) ?? ["", NaN])[1]; //NaN because NaN === NaN returns false
      })
      .map(d => d.name).join(",");
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
        <MapContainer center={[51.77, 19.46]} zoom={12} id={"map"}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            tileSize={256}
            zIndex={-1}
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {this.state.vehicles.map(vehicle => (
            <VehicleMarker vehicle={vehicle}
                           setSelectedVehicle={selectedVehicle => this.setState({selectedVehicle})}
                           isSelected={this.state.selectedVehicle && vehicle.id === this.state.selectedVehicle.id}
                           key={vehicle.id}/>

          ))}
          {this.state.selectedVehicle && <VehicleTrack lines={this.state.lines} vehicle={this.state.selectedVehicle}/>}
        </MapContainer>
      </div>
    );
  }
}

export default withAlert()(App);
