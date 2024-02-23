import { Circlepacking } from "../../components/CirclePacking.js";
import { chartDimensions } from "../chartDimensions.js";
import { createRoundGradient } from "../../components/backgroundGradientGenerator.js";
let chartSectionId = "topArtistsByFollowersBubbles_bot-section1";

export  function circlepacking_2_11(data, chartContainerId) {
  
  let radiusKey = "TOTAL_TRACKS";
  let yKey = "ARTIST_COUNT";
  let xKey = "GENRE_NAME";
  /***********************
   *1. Access data
   ************************/

  /***********************
   *2. Create chart dimensions
   ************************/
  const { boundedWidth: width, boundedHeight: height } =
    chartDimensions(chartContainerId);

  /***********************
   *3. Scale
   ************************/
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d[xKey]).sort())
    .range([0, width]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yKey])])
    .range([height, 0]);
  const rScale = d3
    .scaleSqrt()
    .domain([0, d3.max(data, (d) => d[radiusKey])])
    .range([30, 100]);

  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(data, (d) => d[yKey])]) // Specify the input domain (e.g., the range of values)
    .interpolator(d3.interpolateViridis);

  //     // controls the size of the circles
  //     .range([0, chartSectionWidth / 3]);
  // console.log(chartSectionWidth);
  // const circlePackingData = [];

  // // let uniquePlatform = [...new Set(data.map((d) => d.PLATFORM))];
  // let uniquePlatform = ["Youtube", "Instagram", "Tiktok"];
  // uniquePlatform.forEach((plat) => {
  //     let processedData = d3.packSiblings(
  //         data
  //             .filter((d) => d.PLATFORM == plat)
  //             .sort((a, b) => d3.descending(a.FOLLOWERS_23, b.FOLLOWERS_23))
  //             .map((d) => {
  //                 // console.log(
  //                 //     "each circle radius " + Math.round(rScale(d.FOLLOWERS_23))
  //                 // );
  //                 return {
  //                     r: rScale(d.FOLLOWERS_23),
  //                     PLATFORM: d.PLATFORM,
  //                     ARTIST_NAME: d.ARTIST_NAME,
  //                 };
  //             })
  //     );
  //     processedData.forEach((d) => (d.angle = Math.atan2(d.y, d.x)));
  //     circlePackingData.push({
  //         PLATFORM: plat,
  //         circlepackingData: processedData,
  //     });
  // });

  // let platforms = ["Tiktok", "Instagram", "Youtube"];

  // const colorScale = d3.scaleOrdinal(platforms, [
  //     "#99D8DB",
  //     "#72A8DF",
  //     "#E2B5FD",
  // ]);
  // const charts = d3
  //     .selectAll(".topArtistsByFollowersBubbles_bot-chart")
  //     .data(circlePackingData);
  // charts.each(function (d, i) {
  //     // Call the function with the container selector, width, height, and the central gradient color
  //     createRoundGradient(
  //         ".topArtistsByFollowersBubbles_bot-chart." + d.PLATFORM,
  //         width,
  //         height,
  //         rScale(groupedTotal.get(d.PLATFORM)),
  //         colorScale(d.PLATFORM),
  //         "#F5F4F0",
  //         d.PLATFORM
  //     );
  // });
  /***********************
   *3. Scale
   ************************/

  // foreground circles
  /***********************
   *4. Set up canvas
   ************************/
  const svg = d3
    .select("#" + chartContainerId)
    .append("svg")
    .attr("width", width) // Ensure these are valid, non-zero values
    .attr("height", height)
    .attr("id", "foreground-2-11")
    .style("pointer-events", "none");

  let charts = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cy", function (d) {
      return yScale(d[yKey]) - 20;
    })
    .attr("cx", function (d) {
      return xScale(d[xKey]) + 30;
    })
    .attr("r", (d) => rScale(d[radiusKey]))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 4)
    .attr("stroke-opacity", 1);
  charts.each(function (d, i) {
    let gradientId =
      d[xKey] == "Children's Music"
        ? d[xKey].replace(/[^a-zA-Z0-9-_]/g, "_")
        : d[xKey].replace(/[&/]/g, "");
    // Call the function with the container selector, width, height, and the central gradient color
    createRoundGradient(
      "#vis",
      rScale(d[radiusKey]) * 2,
      rScale(d[radiusKey]) * 2,
      rScale(d[radiusKey]),
      colorScale(d[yKey]),
      "#F5F4F0",
      gradientId,
      `${yScale(d[yKey]) - 20}px 0 0 ${xScale(d[xKey]) + 30}px`,
      25,
      1
    );
  });
}

