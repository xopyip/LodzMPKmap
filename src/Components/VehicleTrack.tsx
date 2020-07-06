import React, {Component} from "react";
import Vehicle from "../Vehicle";
import API from "../API";
import {Polyline} from "react-leaflet";
import Track from "../Track";
import Line from "../Line";

type VehicleTrackProps = {
  vehicle: Vehicle,
  lines: Line[],

};
type VehicleTrackState = {
  track: Track | false,

};

class VehicleTrack extends Component<VehicleTrackProps, VehicleTrackState> {
  constructor(props: VehicleTrackProps) {
    super(props);
    this.state = {
      track: false,
    };
  }

  componentDidMount() {
    let tracks = this.props.lines.filter(line => line.name === this.props.vehicle.name);
    if (tracks.length === 0) {
      return;
    }
    let track = tracks[0].id;
    API.getTracks(track).then(track => {
      this.setState({track});
    });
  }

  calcPoints(roads: { id: number; from: number; to: number; points: [number, number][] }[], indices: number[]): [number, number][][] {
    let ret: ([number, number][])[] = [];
    indices.forEach((v, i) => {
      //get all pairs of indices
      if (i < indices.length - 1) {
        //find path between two selected points
        let f = (roads.filter(r => (r.from === indices[i] && r.to === indices[i + 1]) || (r.to === indices[i] && r.from === indices[i + 1])));
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
          return;
        }
      }
    })
    return ret;
  }

  render() {
    return (
      this.state.track && this.calcPoints(this.state.track.roads, this.getTrackIndices())
        .map(line => <Polyline color={"red"} positions={line} key={line.reduce((a, b) => a + b, "")}/>)
    );
  }

  private getTrackIndices(): number[] {
    if (this.state.track) {
      let item = this.state.track.directions.find(direction => direction.to === this.props.vehicle.to && direction.from === this.props.vehicle.from);
      if (item) return item.indices.forward;
    }
    return [];
  }
}

export default VehicleTrack;