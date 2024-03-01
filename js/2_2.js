// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

// Description: Treemap

import { TreemapComponent } from "./components/Treemap.js";
import { setupResponsiveDimensions, chartDimensions } from "./utility.js";

export function viz_2_2(data, selector, options) {
  let chartContainerId = "gentreTreemap_chart";
  // let selector = "viz_2_2";
  d3.select("#" + selector)
    .select("svg")
    .remove();
  d3.select("#" + selector)
    .append("div")
    .attr("id", chartContainerId);
  /***********************
   *1. Access data
   ************************/
  const { genreType, timeframe } = options;

  /***********************
   *2. Create chart dimensions
   ************************/
  let initialDimensions = chartDimensions(
    selector,
    {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }
  );

  /***********************
   *3. Set up canvas
   ************************/
  // const visElement = d3.select("#" + selector);

  // .attr("viewBox", `0 0 ${width*0.98} ${height*0.98}`)
  // .attr("preserveAspectRatio", "xMidYMid meet");
  function update(newData = data, options,dimensions=initialDimensions) {

    if (newData != null && newData.length > 0) {
      data = newData;
    }
    
    const { boundedWidth: width, boundedHeight: height } = dimensions;
    const { genreType, timeframe } = options;
    const filteredData = data
      .filter((d) => d.TITLE == genreType && d.TIMEFRAME == timeframe)
      .sort((a, b) => d3.descending(+a.VALUE, +b.VALUE))
      .map((d, i) => {
        return {
          GENRE_NAME: d.GENRE_NAME,
          TIMEFRAME: d.TIMEFRAME,
          VALUE: +d.VALUE,
          RANK: i + 1,
          IMAGE_URL: d.IMAGE_URL,
          TITLE: d.TITLE,
        };
      })
      .slice(0, 10);

    TreemapComponent(filteredData, {
      path: (d) => d.GENRE_NAME,
      value: (d) => d.VALUE,
      label: (d) => {
        return [d.RANK, d.GENRE_NAME].join(" | ");
      },
      paddingInner: "8",
      tile: d3.treemapSquarify,
      width: width,
      height: height,
    });
  }
  setupResponsiveDimensions(
    chartContainerId,
    { top: 0, right: 0, bottom: 0, left: 0 },
    (updatedDimensions) => {
      
      // if there is elements, meaning charts already exist
      if (!d3.select("#" + chartContainerId).empty()) {
        update(data, options,updatedDimensions);
        // without the line below, the initialDimensions will not be updated
        // consequently, when clicking to filter the chartdata, update fn is called with the initialDimensions instead of the updatedDimensions
         initialDimensions = updatedDimensions;
      }
    }
  );
  return {
    update,
  };
}
