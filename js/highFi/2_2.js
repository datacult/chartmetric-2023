"use strict";

import { TreemapComponent } from "../../components/Treemap.js";
import { setupResizeListener, chartDimensions } from "../utility.js";
function drawChart(data, selector, genreType, year, timeframe) {
  d3.select("#" + selector)
    .select("svg")
    .remove();
    d3.select("#" + selector).append('div').attr('id', 'gentreTreemap_chart')
  /***********************
   *1. Access data
   ************************/


 
  // console.log([...new Set(data.map((d) => d.TIMEFRAME))]);
  data = data
    .filter((d) => d.TITLE == genreType)
    .filter((d) => d.TIMEFRAME == timeframe) // or 2023
    .filter((d) => d.NAME == year)
    .sort((a, b) => d3.descending(+a.VALUE, +b.VALUE))
    .map((d, i) => {
      return {
        GENRE_NAME: d.GENRE_NAME,
        VALUE: +d.VALUE,
        RANK: i + 1,
        IMAGE_URL: d.IMAGE_URL,
      };
    })
    .slice(0, 10);

  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth, boundedHeight } = chartDimensions(selector);
  const { boundedWidth: width, boundedHeight: height } = chartDimensions(
    selector,
    {
      top: boundedHeight * 0.02,
      right: boundedWidth * 0.02,
      bottom: boundedHeight * 0.02,
      left: boundedWidth * 0.02,
    }
  );

  /***********************
   *3. Set up canvas
   ************************/
  const visElement = d3.select("#" + selector);
  console.log(width, height)
  // .attr("viewBox", `0 0 ${width*0.98} ${height*0.98}`)
  // .attr("preserveAspectRatio", "xMidYMid meet");

  TreemapComponent(visElement, data, {
    path: (d) => d.GENRE_NAME,
    value: (d) => d.VALUE,
    label: (d) => {
      return [d.RANK, d.GENRE_NAME].join(" | ");
    },
    // title: (d, n) => `${d.name}\n${n.value.toLocaleString("en")}`, // text to show on hover
    stroke: "none",
    paddingInner: "16",
    tile: d3.treemapSquarify,
    width: width,
    height: height,
  });
}

export function Treemap(data, selector, genreType, year, timeframe) {
  // console.log(data, selector, genreType, year, timeframe);

  const update = (newData, newGenreType, newYear, newTimeframe) => {

    drawChart(newData,selector,newGenreType, newYear, newTimeframe);
  };

  update(data, genreType, year, timeframe);

  return {
    update,
  };
}