import { CalendarComponent } from "../../components/CalendarComponent.js";
import { chartDimensions } from "../utility.js";
export async function Calendar(chartContainerId) {
  // parameters
  let dataUrl = "./data/T1-4.csv";

  let xKey = "CREATION_DATE";
  let yKey = "DAILY_TRACK_COUNT";
  /***********************
   *1. Access data
   ************************/

  let data = await d3.csv(dataUrl);
  let realData = await d3.csv(
    "https://share.chartmetric.com/year-end-report/2023/viz_2_6_en.csv",
    d3.autoType
  );

  data.forEach((element) => {
    element[xKey] = new Date(element[xKey]);
    element[yKey] = +element[yKey];
  });
  data = data.filter((d) => d[xKey].getFullYear() == 2023);

  /***********************
   *2. Create chart dimensions
   ************************/
  // Get the element by its ID
  const visElement = document.getElementById(chartContainerId);

  // Get the bounding rectangle of the element
  const rect = visElement.getBoundingClientRect();
  const dimensions = chartDimensions(chartContainerId);
  /***********************
   *3. Set up canvas
   ************************/
  // Create the SVG container.
  const wrapper = d3.select(visElement);
  const h = ((dimensions.boundedHeight / 2 + 5) * 365) / 7;
  const w = dimensions.boundedWidth;
  wrapper.style("height", h + "px")
 
  const svg = wrapper
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    // .attr("viewBox", [0, 0, dimensions.boundedWidth, dimensions.boundedHeight])
    .attr("style", "max-width: 100%");

  CalendarComponent(svg, data, {
    x: (d) => d[xKey],
    y: (d) => d[yKey],

    width: dimensions.boundedWidth,
    // height: dimensions.boundedHeight,
    colors: ["#DFF3DB", "#CCEBC5", "#8bc6fb"],
    cellSize: dimensions.boundedHeight / 2,
    paddingBetweenCells: 5,
  });
}
