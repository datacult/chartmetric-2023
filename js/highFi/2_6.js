import { CalendarComponent } from "../../components/CalendarComponent.js";
import { chartDimensions, setupResponsiveDimensions } from "../utility.js";
export function Calendar(data, selector, chartContainerId = "calendarHeatmap") {
  d3.select("#" + selector)
    .append("div")
    .attr("id", "calendarHeatmap");
  d3.select("#" + selector)
    .append("div")
    .attr("id", "rotatingPhotos");
  let xKey = "RELEASE_DATE";
  let yKey = "DAILY_TRACK_RELEASE_COUNT";
  /***********************
   *1. Access data
   ************************/
  console.log(data);
  data.forEach((element) => {
    element[xKey] = new Date(element[xKey]);
    element[yKey] = +element[yKey];
  });
  let dataset = data

  /***********************
   *2. Create chart dimensions
   ************************/
  // Get the element by its ID
  const visElement = document.getElementById(chartContainerId);

  // Get the bounding rectangle of the element

  const dimensions = chartDimensions(chartContainerId);
  /***********************
   *3. Set up canvas
   ************************/
  // Create the SVG container.
  const wrapper = d3.select(visElement);

  const svg = wrapper
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")

    .attr("style", "max-width: 100%");

  function update(data, updatedDimensions) {
    CalendarComponent(svg, data, {

      x: (d) =>d['RELEASE_DATE'],
      y: (d) => d['DAILY_TRACK_RELEASE_COUNT'],

    dimensions: updatedDimensions,
      colors: ["#DFF3DB", "#0769AC"],
      cellSize: updatedDimensions.width / 7,
      paddingBetweenCells: 5,
    });
  }

  update(dataset, dimensions);


  setupResponsiveDimensions(
    chartContainerId,
    { top: 10, right: 20, bottom: 10, left: 60 },
    (updatedDimensions) => {
      // if there is elements, meaning charts already exist
      if (!d3.select("#" + chartContainerId).empty()) {

        update(dataset, updatedDimensions);
      }
    }
  );
  return {
    update: update,
  };
}
