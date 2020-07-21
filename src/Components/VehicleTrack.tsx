import React, {Component} from "react";
import API from "../API";
import {Polyline} from "react-leaflet";
import {Line, Track, Vehicle} from "../types";

type VehicleTrackProps = {
  vehicle: Vehicle,
  lines: Line[],

};
type VehicleTrackState = {
  track: Track | false,
  polyline: [number, number][][],

};

class VehicleTrack extends Component<VehicleTrackProps, VehicleTrackState> {
  constructor(props: VehicleTrackProps) {
    super(props);
    this.state = {
      track: false,
      polyline: []
    };
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps: Readonly<VehicleTrackProps>, prevState: Readonly<VehicleTrackState>, snapshot?: any) {
    if (prevProps.vehicle !== this.props.vehicle) {
      this.update();
    }
  }

  render() {
    return (
      <Polyline color={"red"} positions={this.state.polyline}/>
    );
  }

  private getTrackIndices(track: Track): number[] {
    if (track) {
      let item = track.directions.find(direction => (
        (direction.to === this.props.vehicle.to && direction.from === this.props.vehicle.from) ||
        (direction.to === this.props.vehicle.from && direction.from === this.props.vehicle.to)
      ));
      if (item) return item.indices.forward;
      else {
        console.log("no direction found", {
          dir: track.directions,
          vehicle: this.props.vehicle
        });
      }
    }
    return [];
  }

  private update() {
    this.setState({polyline: []});
    let tracks = this.props.lines.filter(line => line.name === this.props.vehicle.name);
    if (tracks.length === 0) {
      console.log("track not found");
      return;
    }
    let track = tracks[0].id;
    API.getTracks(track).then(track => {
      let indices = this.getTrackIndices(track);
      let ret: ([number, number][])[] = [];
      indices.forEach((v, i) => {
        //get all pairs of indices
        if (i < indices.length - 1) {
          //find path between two selected points
          let f = (track.roads.filter(r => (r.from === indices[i] && r.to === indices[i + 1]) || (r.to === indices[i] && r.from === indices[i + 1])));
          if (f.length > 0) {
            if (ret.length > 0) {
              //connect previous part with current
              ret.push([
                ret.reverse()[0].reverse()[0],
                f[0].points[0],
              ]);
            }
            //push new path part
            ret.push(f[0].points);
          }
        }
      })
      this.setState({polyline: ret});
    });
  }
}

export default VehicleTrack;