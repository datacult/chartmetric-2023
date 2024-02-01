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
    const barContainers = wrapper.selectAll("div.bar").data(top10, (d) => {
      return trimNames(d.ARTIST_NAME + d.COUNTRY_NAME);
    });

    barContainers.join(
      // Enter selection
      (enter) => {
        const divEnter = enter
          .append("div")
          .attr("class", "gradient-bar bar")
          .html(
            (d) => `
            <img style="width:${height / 18}px; height:${height / 18}px" 
            id=${d.ARTIST_NAME}
                 src="${d[imageKey]}"
                 alt="${d.Group}" class="artist-image">
            <span class="artist-name" id=${d.ARTIST_NAME}>${d.ARTIST_NAME
              }</span>
          `
          )
          .style("opacity", 0)
          .style("width", 0)
          .transition()
          .duration(1500) // Duration for enter transition
          .style("opacity", 1)
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
          .style("width", 0)
          .style("opacity", 0)
          .style("left", -3000 + "px")
          .remove()
    );
    d3.selectAll(".gradient-bar.bar")
      .on("mouseenter", function (event, d) {
        
        let hoveredArtistGenres = d.ARTIST_GENRE;
        d3.select(this).append("div").attr("class", "tooltip").html(`
        <div class="flag"> </div>
        <div class="career-stack">
        ${d["ARTIST_STAGE"] == "Null"
            ? ""
            : d["ARTIST_STAGE"]
          }
        </div>
        <div class="genre-stack">
          <div class="card">${hoveredArtistGenres}</div>
          
        </div>
        `);
        // get the tooltip width
        let barElement = d3.select(this);

        // get the bar width
        let profileBarWidth = barElement.node().getBoundingClientRect().width;
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
        gsap.fromTo(
          ".tooltip",
          { left: profileBarWidth, opacity: 0 },
          {
            left: childWidth * 1.5,
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
          }
        );
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
