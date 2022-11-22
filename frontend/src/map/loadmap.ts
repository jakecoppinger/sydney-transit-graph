import * as mapboxgl from "mapbox-gl";
import { OurWindow } from "../frontend-only-interfaces";

/**
 * Load mapbox map. Has side effect of setting map to the window object when it loads,
 * after a callback.
 */
export function loadMap(): void {
  const map = new mapboxgl.Map({
    container: "map",
    accessToken:
      "pk.eyJ1IjoiamFrZWMiLCJhIjoiY2pkNWF2ZnhqMmZscTJxcGE2amtwZnJ0aiJ9.5OojKRkdmcpPUPiFH1K0_Q",
    style: "mapbox://styles/mapbox/dark-v10",
    center: [151.2093, -33.8688], // starting position
    zoom: 11,
    logoPosition: "bottom-right",
  });

  map.on("load", function () {
    map.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    map.addLayer({
      id: "point",
      source: "points",
      type: "circle",
      paint: {
        'circle-color': ['case',
          ['==', ['feature-state', 'selected'], true], '#fa6262',
          '#007cbf'
        ]
        // These attributes definitely work
        // "circle-radius": 10,
        // "circle-color": "#007cbf",
      },
    });

    (window as OurWindow).globalMap = map;
  });
}
