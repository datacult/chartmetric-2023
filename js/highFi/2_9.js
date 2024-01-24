"use strict";

import { chartDimensions } from "../chartDimensions.js";
import { setupResizeListener } from "../utility.js";
export async function gradientBar(
  dataset,
  chartContainerId,
  widthKey,
  selectedValue
) {
  /***********************
   *1. Access data
   ************************/

  dataset = dataset.sort((a, b) => d3.descending(a[widthKey], b[widthKey])); // .sort((a, b) => d3.descending(a.SPINS, b.SPINS));
  let countries_names = [...new Set(dataset.map((d) => d.COUNTRY_NAME))];
  countries_names.unshift("All Countries");
  // let data = dataset.filter((d) => d.COUNTRY_NAME == selectedValue);
  let data = dataset.slice(0, 10);

  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth: width, boundedHeight: height } =
    chartDimensions(chartContainerId);
  /***********************
   *3. Set up canvas
   ************************/
  const visElement = document.getElementById(chartContainerId);
  const wrapper = d3.select(visElement);

  // Select the top 10 rows using d3.slice

  const globalTop10 = data.slice(0, 10);

  /***********************
   *4. Create scales
   ************************/
  const widthScale = d3
    .scaleLinear()
    .domain([0, d3.max(globalTop10, (d) => d[widthKey])])
    .range([350, width]);

  /***********************
   *5. Draw canvas
   ************************/
  function drawElements(top10) {
    // Bind the data to the elements with a key function for object constancy
    const barContainers = wrapper
      .selectAll("div.bar")
      .data(top10, (d) => d.ARTIST_NAME);

    // Use join to handle enter, update, and exit selections
    const enterSelection = barContainers
      .enter()
      .append("div")
      .attr("class", "gradient-bar bar")
      .html(
        (d) => `
      <img style="width:${height / 18}px; height:${height / 18}px" 
           src="https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/1.jpg" 
           alt="${d.Group}" class="artist-image">
      <span class="artist-name">${d.ARTIST_NAME}</span>
    `
      )
      .style("opacity", 0)
      .style("width", 0);

    // Animate entering elements
    enterSelection
      .transition()
      .duration(3500) // Duration for enter transition
      .style("opacity", 1)
      .style("width", (d) => widthScale(d[widthKey]) + "px");

    // Update selection
    barContainers
      .transition()
      .duration(500) // Duration for update transition
      .style("width", (d) => widthScale(d[widthKey]) + "px");

    // Exit selection
    barContainers
      .exit()
      .transition()
      .duration(500) // Duration for exit transition
      .style("width", 0)
      .style("opacity", 0)
      .remove();
    d3.selectAll(".gradient-bar.bar")
      .on("mouseenter", function (d) {
        d3.select(this).append("div").attr("class", "tooltip").html(`
        <div class='name'>Artist Name</div>
        <div class="flag"> </div>
        <div class="card-stack">
          <div class="card">R&B/Soul</div>
          <div class="card">Jazz</div>
          <div class="card">Pop</div>
        </div>`);
        let fromRight = d3
          .select(".tooltip")
          .node()
          .getBoundingClientRect().width;
        gsap.fromTo(
          ".tooltip",
          { right: -fromRight, opacity: 0 },
          { right: 0, opacity: 1, duration: 0.5, ease: "power2.inOut" }
        );
      })
      .on("mouseleave", function (d) {
        d3.select(this).select("div.tooltip").remove();
      });
  }

  function update(data,selectedValue) {
    if (selectedValue == "All Countries") {
      data = dataset.slice(0, 10);
      drawElements(data);
    } else {
      data = dataset.filter((d) => d.COUNTRY_NAME == selectedValue);
      drawElements(data);
    }
  }
  update(data,selectedValue);

  return update;
}
