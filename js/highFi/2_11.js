import { Circlepacking } from "../../components/CirclePacking.js";
import { chartDimensions } from "../chartDimensions.js";

let chartSectionId = "topArtistsByFollowersBubbles_bot-section1";
// Function to create a round gradient
// function createRoundGradient(
//   selector,
//   width,
//   height,
//   radius,
//   innerColor,
//   outerColor,
//   gradientId
// ) {
//   // Create the SVG container
//   let svg = d3
//     .select(selector)
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("viewBox", `0 0 ${width} ${height}`)
//     .attr("fill", "none")
//     .attr("id", "gradient-background")
//     .style("position", "absolute");
//   // Define a radial gradient
//   let defs = svg.append("defs");
//   let radialGradient = defs.append("radialGradient").attr("id", gradientId);

//   // Define the color stops of the gradient
//   radialGradient
//     .append("stop")
//     .attr("offset", "90%")
//     .attr("stop-color", innerColor);

//   radialGradient
//     .append("stop")
//     .attr("offset", "100%")
//     .attr("stop-color", outerColor);

//   // Append the circle and fill it with the gradient
//   svg
//     .append("circle")
//     .attr("cx", width / 2)
//     .attr("cy", height / 2)
//     .attr("r", radius * 1.5)
//     .attr("fill", `url(#${gradientId})`);

//   // Append defs and filter for the Gaussian blur to the whole SVG to get the soft edge effect
//   let filter = defs
//     .append("filter")

//     .attr("x", "-50%")
//     .attr("y", "-50%")
//     .attr("width", "200%")
//     .attr("height", "200%")
//     .attr("id", `${gradientId}-glow`);
//   filter
//     .append("feGaussianBlur")
//     .attr("stdDeviation", 50)
//     .attr("result", "coloredBlur");

//   // Apply the filter to the SVG container
//   svg.style("filter", `url(#${gradientId}-glow)`);
// }

async function draw() {
  let dataUrl =
    "https://share.chartmetric.com/year-end-report/2023/viz_2_11_en.csv";
  let chartContainerId = "vis";
  let radiusKey = "TOTAL_TRACKS";
  let yKey = "TRACKS_PER_ARTIST";
  let xKey = "GENRE_NAME";
  /***********************
   *1. Access data
   ************************/

  let data = await d3.csv(dataUrl, d3.autoType);

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
    .range([0, 50]);
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

  // foreground circles
  /***********************
   *3. Set up canvas
   ************************/
  const svg = d3
    .select("#vis")
    .append("svg")
    .attr("width", width) // Ensure these are valid, non-zero values
    .attr("height", height)
    .attr("id", "foreground-2-11")
    .style("pointer-events", "none");

  svg
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
    .attr("fill", "#4baea0");


  // const groups = svg
  //     .append("g")
  //     .attr("transform", `translate(${width / 2},${height / 2})`);

  // const circlesSelection = groups
  //     .selectAll("circle")
  //     .data((d) => d.circlepackingData);
  // circlesSelection
  //     .join("circle")
  //     .style("pointer-events", "all")
  //     .attr("id", d=>d.PLATFORM+d.ARTIST_NAME)
  //     .attr("stroke", (d) => "lightgrey")
  //     .attr("stroke-width", (d) => 3)
  //     .attr("fill", (d, i) => colorScale(d.PLATFORM))
  //     .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 60))
  //     .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 60))
  //     .attr("r", (d) => d.r - 0.25)
  //     .transition()
  //     .ease(d3.easeCubicOut)
  //     .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
  //     .duration(1000)
  //     .attr("cx", (d) => d.x)
  //     .attr("cy", (d) => d.y)
  //     .style("mix-blend-mode", "luminosity");
  // circlesSelection
  //     .join("circle")
  //     .style("pointer-events", "all")
  //     .attr("class", "circle-1-5")
  //     .attr("stroke", (d) => "white")
  //     .attr("stroke-width", (d) => 3)
  //     .attr("fill", (d, i) => `url(#image-fill-)`)
  //     .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 60))
  //     .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 60))
  //     .attr("r", (d) => d.r - 0.25)
  //     .transition()
  //     .ease(d3.easeCubicOut)
  //     .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
  //     .duration(1000)
  //     .attr("cx", (d) => d.x)
  //     .attr("cy", (d) => d.y)
  //     .style("mix-blend-mode", "luminosity");
  // // Correcting the event handling
  // d3.selectAll(".circle-1-5")
  //     .on("mouseenter", function (event, d) {
  //         console.log(d.ARTIST_NAME)
  //         d3.select(`[id="${d.PLATFORM+d.ARTIST_NAME}"]`)
  //             .attr("fill", "none"); // Replace 'yourNewColor' with the desired color
  //     })
  //     .on(" mouseleave", function (event, d) {
  //         d3.select(`[id="${d.PLATFORM+d.ARTIST_NAME}"]`)
  //             .attr("fill", d0=> colorScale(d0.PLATFORM)); // Transition back to the original color
  //     });
}
draw();
