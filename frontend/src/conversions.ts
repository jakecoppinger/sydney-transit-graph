import * as p5 from "p5";
export function convertX(p: p5, x: number) {
  return x;
  // return x - (p.windowWidth/2)
}
export function convertY(p: p5, y: number) {
  return y;
  // return y - (p.windowHeight/2)
}
