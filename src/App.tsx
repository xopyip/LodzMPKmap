import React from 'react';
import axios from "axios";
import {Map, Marker, TileLayer, Tooltip} from 'react-leaflet';
import {AlertManager, withAlert} from 'react-alert'


type Vehicle = {
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  timeToNextStation: number, //in seconds
  name: string
}

type AppProps = {
  alert:AlertManager
};
type AppState = {
  search: string,
  lines: string[],
  vehicles: Vehicle[]
};

class App extends React.Component<AppProps, AppState> {
  // @ts-ignore
  private interval: NodeJS.Timeout;
  constructor(props: AppProps) {
    super(props);
    this.state = {
      search: "",
      lines: [],
      vehicles: []
    }
    this.findVehicles = this.findVehicles.bind(this);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidMount() {
    axios.get("https://lodz.mateuszbaluch.tech/api/Home/GetRouteList").then(response => response.data)
      .then(data => {
        let lines = [];
        for(let ar of data){
          for(let o of ar){
            if(typeof o === "object"){
              for(let p of o){
                if(typeof p === "string"){
                  lines.push(p);
                }
              }
            }
          }
        }
        this.setState({lines});
      })
  }

  loadVehicles(r: string){
    axios.post("https://lodz.mateuszbaluch.tech/api/Home/CNR_GetVehicles", {r}).then(response => response.data)
      .then((data : string) => {
        let lines = data.split("\n")
        let r = /<p>(.*)<\/p>/;
        let vehicles = [];
        for(let line of lines){
          let match = line.match(r);
          if(match){
            let vehicle = (JSON.parse(match[1]));
            vehicles.push({
              lon1: vehicle[10],
              lat1: vehicle[9],
              lon2: vehicle[12],
              lat2: vehicle[11],
              name: vehicle[2],
              timeToNextStation: vehicle[13],
            });
          }
        }
        this.setState({vehicles});
      })
  }

  findVehicles(e: React.FormEvent) {
    clearInterval(this.interval);
    e.preventDefault();
    console.log(this.state.search);
    let r = this.state.lines.filter(line => line.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1).join(",");
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
            <>

              <Marker position={[vehicle.lon1, vehicle.lat1]}>
                <Tooltip>
                  {vehicle.name}
                </Tooltip>
              </Marker>
            </>
            ))}
        </Map>
      </div>
    );
  }
}

export default withAlert()(App);
