"use strict";

import { chartDimensions } from "../chartDimensions.js";
import { setupResizeListener, trimNames } from "../utility.js";
export function gradientBar(
  dataset,
  chartContainerId,

  selectedValue
) {
  let widthKey = "CM_SCORE";
  let imageKey = "IMAGE_URL";
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
  const wrapper = d3
    .select(visElement)
    .append("div")
    .attr("id", "topArtistsBankingBars_barChart");


  /***********************
   *5. Draw canvas
   ************************/
  function drawElements(top10) {

    // Select the top 10 rows using d3.slice

    const globalTop10 = top10.slice(0, 10);

    /***********************
     *4. Create scales
     ************************/
    const widthScale = d3
      .scaleLinear()
      .domain([0, d3.max(globalTop10, (d) => d[widthKey])])
      .range([350, width]);

    // Bind the data to the elements with a key function for object constancy
    const barContainers = wrapper.selectAll("div.bar").data(top10, (d) => {
      return trimNames(d.ARTIST_NAME + d.COUNTRY_NAME);
    });

    barContainers.join(
      // Enter selection
      (enter) => {

        const exitDuration = 450
        const divEnter = enter
          .append("div")
          .attr("class", "gradient-bar bar")
          .html(
            (d, i) => `
            <img style="width:${height / 18}px; height:${height / 18}px" 
            id=${d.ARTIST_NAME}
                 src="${d[imageKey]}"
                 alt="${d.Group}" class="artist-image">
            <span class="artist-name" id=${d.ARTIST_NAME}>${i + 1}. ${d.ARTIST_NAME
              }</span>
          `
          )

          .style("opacity", 0)
          .style("width", 0)
          .style("transfrom", "translate3d(-1000px, 0px, 0px)")
          .transition()
          .duration(1000) // Duration for enter transition
          .delay((d, i) => exitDuration + i * 30)
          .style("opacity", 1)
          .style("transfrom", "translate3d(0px, 0px, 0px)")
          .style("width", (d) => widthScale(d[widthKey]) + "px");

        return divEnter;
      },
      // Update selection
      (update) =>
        update
          .transition()
          .duration(500) // Duration for update transition
          .style("width", (d) => widthScale(d[widthKey]) + "px"),
      // Exit selection
      (exit) =>
        exit
          .transition()
          .duration(500) // Duration for exit transition
          .delay((d, i) => i * 30)
          .style("width", 0)
          .style("opacity", 0)
          .style("left", -3000 + "px")
          .remove()
    );
    d3.selectAll(".gradient-bar.bar")
      .on("mouseenter", function (event, d) {

        let hoveredArtistGenres = JSON.parse(d.ARTIST_GENRES);
        let tooltip = d3.select(this).append("div").attr("class", "tooltip").html(`
        <div class="career-stack">
        ${d["ARTIST_STAGE"] == "Null"
            ? ""
            : d["ARTIST_STAGE"]
          }
        </div>
        <div class="genre-stack">
          <div class="card">${hoveredArtistGenres.join(" | ")}</div>
          
        </div>
        `);
        // get the tooltip width
        let barElement = d3.select(this);

        // get the image width
        let imageWidth = barElement
          .select(".artist-image")
          .node()
          .getBoundingClientRect().width;
        let nameWidth = barElement
          .select(".artist-name")
          .node()
          .getBoundingClientRect().width;

        let childWidth = imageWidth + nameWidth;

        tooltip.transition()
          .duration(500)
          .style("opacity", 1)
          .style("left", (childWidth * 1.5) + "px")
          .ease(d3.easeInOut);

      })
      .on("mouseleave", function (d) {
        d3.select(this).select("div.tooltip").remove();
      });
  }

  function update(data, selectedValue) {
    data = dataset.filter((d) => d.COUNTRY_NAME == selectedValue);
    drawElements(data);
  }
  update(data, selectedValue);

  return {
    update: update,
  };
}
