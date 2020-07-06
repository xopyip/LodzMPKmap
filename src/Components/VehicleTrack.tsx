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
  polyline: [number, number][][],

};

class VehicleTrack extends Component<VehicleTrackProps, VehicleTrackState> {
  constructor(props: VehicleTrackProps) {
    super(props);
    this.state = {
      track: false,
      polyline: []
    };
  }

  componentDidMount() {
    let tracks = this.props.lines.filter(line => line.name === this.props.vehicle.name);
    if (tracks.length === 0) {
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

  render() {
    return (
      <Polyline color={"red"} positions={this.state.polyline}/>
    );
  }

  private getTrackIndices(track: Track): number[] {
    if (track) {
      let item = track.directions.find(direction => direction.to === this.props.vehicle.to && direction.from === this.props.vehicle.from);
      if (item) return item.indices.forward;
    }
    return [];
  }
}

export default VehicleTrack;