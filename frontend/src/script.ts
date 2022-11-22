// import * as p5 from "p5/lib/p5.min.js"
import * as p5 from "p5";
// p5.disableFriendlyErrors = true;
import { focusBusSearch, blurBusSearch, debouncedBusSearch } from "./search";
import { busSearchSelector } from "./selectors";
import { OurWindow } from "./frontend-only-interfaces";
import { sketch } from "./processing/sketch";
import { loadMap } from "./map/loadmap";
import * as moment from "moment";
import { redrawBusTraces } from './redrawing';
const flatpickr = require("flatpickr");

initialiseWindowObject();

// Start the processing sketch
const myp5 = new p5(sketch);
(window as OurWindow).p5_object = myp5;

// Start the mapbox map
loadMap();

document.addEventListener("DOMContentLoaded", function (event) {
  const busSearchInput = document.querySelector(busSearchSelector);
  if (busSearchInput === null) {
    throw new Error("One of the frontend controls is null :(");
  }
  busSearchInput.addEventListener("focus", focusBusSearch);
  busSearchInput.addEventListener("blur", blurBusSearch);
  busSearchInput.addEventListener("keyup", debouncedBusSearch);

  const datetimePicker = flatpickr("#datetimepicker", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    maxDate: "today"
  });

  datetimePicker.set("onChange", function (d: Date[]) {
    const isoTime = d[0].toISOString();

    const newStartTimestamp = moment(isoTime);
    const newEndTimestamp = moment(isoTime);
    newEndTimestamp.add(40, "minutes");

    (window as OurWindow).startTimestamp = newStartTimestamp.toISOString();
    (window as OurWindow).endTimestamp = newEndTimestamp.toISOString();
    console.log(isoTime);
    console.log({ newStartTimestamp, newEndTimestamp });
    redrawBusTraces();
  })
});

/**
 * Set global variables on the window as per OurWindow interface
 */
function initialiseWindowObject(): void {
  (window as OurWindow).routeId = '30-370-sj2-1';

  const newEndTimestamp = moment();
  const newStartTimestamp = moment(newEndTimestamp); // TODO: Change with duration
  newStartTimestamp.subtract(40, "minutes");

  (window as OurWindow).startTimestamp = newStartTimestamp.toISOString();
  (window as OurWindow).endTimestamp = newEndTimestamp.toISOString();
}