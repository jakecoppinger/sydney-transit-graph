import { busSearchSelector, optionsDivSelector } from "./selectors";
import { getConfig } from "./utils/config";
import { redrawBusTraces } from './redrawing'
import {
  FrontendBusProgressWaypointInterface,
  SearchResultInterface,
} from "./interfaces";
import { drawBusTraces, updateRouteTitle } from "./ui";
import { OurWindow } from "./frontend-only-interfaces";
import { debounce } from "ts-debounce";
import { setMapboxFeatures, updateMapPointSelection } from "./map/points";

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
export function focusBusSearch() {
  console.log("Called myFunction");
  const options = document.getElementById("options");
  if (options) {
    options.classList.add("show");
  }
}

export function blurBusSearch() {
  console.log("Called blurBusSearch");
  const options = document.getElementById("options");
  if (options) {
    options.classList.remove("show");
  }
}

/**
 * Send a request to the backend to find bus routes. Can match bus route
 * numbers, or english names of the route. Returns undefined if backend fails,
 * or list (possibly empty) of routes.
 * @param searchStr 
 * @returns 
 */
async function searchBuses(
  searchStr: string
): Promise<SearchResultInterface[] | undefined> {
  const {
    backendServerHostname,
    isBackendServerSecure,
    backendServerPort,
  } = getConfig();
  const domain = `${isBackendServerSecure ? "https" : "http"
    }://${backendServerHostname}${backendServerPort !== 433 ? `:${backendServerPort}` : ''}/`;
  const path = `v3/search_routes`;
  const params = new URLSearchParams({ search_string: searchStr });
  const fullUrl = `${domain}${path}?${params}`;
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.json() as Promise<SearchResultInterface[]>;
  } catch (e) {
    console.error("Post for search failed - rate limit?");
    console.error(e);
    return undefined;
  }
}

function selectBus(ev: MouseEvent) {
  blurBusSearch();

  console.log("SelectBus called");
  console.log({ ev });

  // @ts-ignore
  const rawRouteId: any = ev.target.attributes.data.value;
  // @ts-ignore
  const rawShortRouteId: any = ev.target.attributes['data-short'].value;
  if (typeof rawRouteId !== "string") {
    throw new Error("Couldn't get routeId from link");
  }
  if (typeof rawShortRouteId !== "string") {
    throw new Error("Couldn't get short routeId from link");
  }
  const routeId: string = rawRouteId;
  const shortRouteId: string = rawShortRouteId;

  updateRouteTitle(shortRouteId);
  const p5 = (window as OurWindow).p5_object;

  console.log("Fetching bus traces...");

  if (p5 === undefined) {
    throw new Error("p5 not found on window object");
  }

  setMapboxFeatures([]);
  (window as OurWindow).selectedTripId = undefined;
  (window as OurWindow).routeId = routeId;

  redrawBusTraces();
}

export const debouncedBusSearch = debounce(oninputBusSearch, 100, {
  isImmediate: true,
  maxWait: 100
});

export async function oninputBusSearch(): Promise<void> {
  const input = document.querySelector(busSearchSelector) as HTMLInputElement;
  if (input === null) {
    throw new Error("Bus search input doesn't exist");
  }

  const searchText = input.value;
  const results = await searchBuses(searchText);
  if (results === undefined) {
    return;
  }

  const optionsDiv = document.querySelector(
    optionsDivSelector
  ) as HTMLDivElement;
  optionsDiv.innerHTML = "";

  results.forEach((result) => {
    const a = document.createElement("a");
    a.href = "#";
    a.onmousedown = selectBus;
    a.setAttribute("data", result.route_id);
    a.setAttribute("data-short", result.route_short_name);

    const linkText = document.createTextNode(
      `${result.route_short_name} - ${result.route_long_name}`
    );
    a.appendChild(linkText);
    optionsDiv.appendChild(a);
  });
}
