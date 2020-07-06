type Track = {
  stops: any,
  roads: { id: number, from: number, to: number, points: [number, number][] }[]
  indices: { forward: number[], backward: number[] }[],
  directions: {
    to: string,
    from: string,
    indices: { forward: number[], backward: number[] },
  }[]
};
export default Track;