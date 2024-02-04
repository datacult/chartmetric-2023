import { createRoundGradient } from "../../components/backgroundGradientGenerator.js";
import { trimNames,setupResponsiveDimensions, chartDimensions } from "../utility.js";

// Function to create a round gradient

export function circlepacking_1_5(realData, selector, type = "All Time") {
  selector = "#" + selector;
  /***********************
   *1. Access data
   ************************/
  let chartSectionId = "topArtistsByFollowersBubbles_bot-section1";

  console.log(selector)
  /***********************
   *2. Create chart dimensions
   ************************/
  const { boundedWidth, boundedHeight: height } =
    chartDimensions(selector);
    let width
    if (boundedWidth < 760) {
      width = boundedWidth
    
    } else {
      //! the width of the chart is 1/3 of the bounded width
      width = boundedWidth / 3
      console.log('1/3 width', width)
    }
  d3.select(selector).html(`   <div id="topArtistsByFollowersBubbles_bottom">
      <div class="topArtistsByFollowersBubbles_bot-section" id=${chartSectionId}>
        <div class="topArtistsByFollowersBubbles_bot-chart Youtube" id="topArtistsByFollowersBubbles_bot-chart"></div>
        <div class="topArtistsByFollowersBubbles_bot-icon"></div>
      </div>
      <div class="topArtistsByFollowersBubbles_bot-section">
        <div class="topArtistsByFollowersBubbles_bot-chart Instagram"></div>
        <div class="topArtistsByFollowersBubbles_bot-icon"></div>
      </div>
      <div class="topArtistsByFollowersBubbles_bot-section">
        <div class="topArtistsByFollowersBubbles_bot-chart Tiktok"></div>
        <div class="topArtistsByFollowersBubbles_bot-icon"></div>
      </div>
    </div>`);

  realData.forEach((entry) => {
    if (entry.PLATFORM) {
      entry.Combined = `${entry.PLATFORM}/${entry.ARTIST_NAME}`;
    }
  });
  function createOrUpdateChart(data, type) {
    data = realData.filter((d) => d.TYPE == type);

    // real width of each chart, instead of 1/3 of container
    const {
      boundedWidth: chartSectionWidth,
      boundedHeight: chartSectionHeight,
    } = chartDimensions(chartSectionId);
    
    /***********************
     *3. Scale
     ************************/
    // rScale
    let groupedTotal = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => +d.FOLLOWERS),
      (d) => d.PLATFORM
    );
    let maxGroupValue = d3.max(Array.from(groupedTotal.values()));
    const rScale = d3
      .scaleSqrt()
      .domain([0, maxGroupValue])
      // controls the size of the circles
      .range([12, chartSectionWidth / 3]);

    const circlePackingData = [];

    // let uniquePlatform = [...new Set(data.map((d) => d.PLATFORM))];
    let uniquePlatform = [, "Youtube", "Instagram", "Tiktok"];
    uniquePlatform.forEach((plat) => {
      let processedData = d3.packSiblings(
        data
          .filter((d) => d.PLATFORM == plat)
          .sort((a, b) => d3.descending(a.FOLLOWERS, b.FOLLOWERS))
          .map((d) => {
            return {
              r: rScale(+d.FOLLOWERS),
              PLATFORM: d.PLATFORM,
              ARTIST_NAME: d.ARTIST_NAME,
              FOLLOWERS: d.FOLLOWERS,
              IMAGE_URL: d.IMAGE_URL,
            };
          })
      );
      processedData.forEach((d) => (d.angle = Math.atan2(d.y, d.x)));
      circlePackingData.push({
        PLATFORM: plat,
        circlepackingData: processedData,
      });
    });

    // color scale
    let platforms = ["Tiktok", "Instagram", "Youtube"];
    const colorScale = d3.scaleOrdinal(platforms, [
      "#99D8DB",
      "#72A8DF",
      "#E2B5FD",
    ]);
    const charts = d3
      .selectAll(".topArtistsByFollowersBubbles_bot-chart")
      .data(circlePackingData);

    charts.each(function (d, i) {
      let chart = d3.select(this);
      let svg = chart.select("svg#bubble-foreground");
      // Append images

      // Call the function with the container selector, width, height, and the central gradient color
      if (svg.empty()) {
        svg = chart
          .append("svg")
          .attr("width", chartSectionWidth)
          .attr("height", chartSectionHeight)
          .attr("id", "bubble-foreground")
          .style("pointer-events", "none");
        createRoundGradient(
          ".topArtistsByFollowersBubbles_bot-chart." + d.PLATFORM,
          chartSectionWidth,
          chartSectionHeight,
          rScale(groupedTotal.get(d.PLATFORM)),
          colorScale(d.PLATFORM),
          "#F5F4F0",
          d.PLATFORM
        );

        const defs = svg
          .append("defs")
          .attr("id", (d, i) => `defs-${d.PLATFORM}`);
      }

      d3.select("defs#defs-" + d.PLATFORM)
        .selectAll("pattern")
        // load all the images at once instead of at each button click
        .data(realData.filter((r) => r.PLATFORM == d.PLATFORM))
        .enter()
        .append("pattern")
        .attr("id", (d) => {
          return trimNames(d.ARTIST_NAME) + "_img";
        }) // Unique ID for each pattern
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("xlink:href", (d) => {
          // console.log(d)
          return d.IMAGE_URL;
        }) // URL of the image
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "xMidYMid meet");
      updateCircles(
        svg,
        d.circlepackingData,
        colorScale,
        chartSectionWidth,
        chartSectionHeight
      );
    });

    d3.selectAll(".circle-1-5")
      .on("mouseover", function (event, d) {
        d3.select(`[id="${d.PLATFORM + d.ARTIST_NAME}"]`)
          .transition()
          .duration(500)
          .style("fill-opacity", "0");

        const [xCoord, yCoord] = d3.pointer(event);
        let x = xCoord + chartSectionWidth / 2;
        let y = yCoord + chartSectionHeight / 2;
        d3
          .select(".topArtistsByFollowersBubbles_bot-chart." + d.PLATFORM)
          .append("div")
          .attr("id", "tooltip_1_5")
          .style("display", "block")
          .style("left", x + 5 + "px")
          .style("top", y + 5 + "px").html(`
              <div class="topline">
        <div class="state">${d.ARTIST_NAME}</div>
        <div class="billHR">${d.PLATFORM}</div>
        <div class="billText">
            ⮕ <strong>Followers:</strong> ${d3.format(".3s")(d.FOLLOWERS)}
        </div>
        </div>
  `);
        gsap.to("#tooltip_1_5", { duration: 0.3, scale: 1, ease: "circ.out" });
      })
      .on("mouseleave", function (event, d) {
        d3.select(`[id="${d.PLATFORM + d.ARTIST_NAME}"]`)
          .transition()
          .duration(500)
          .style("fill-opacity", 1)
          .attr("fill", (d0) => colorScale(d0.PLATFORM)); // Transition back to the original color

        d3.select("#tooltip_1_5").remove();
      });
  }
  function updateCircles(
    svg,
    data,
    colorScale,
    chartSectionWidth,
    chartSectionHeight
  ) {
    // `container` is represent each element in `charts` selection
    //* select the svg element id, if it's not there, create one
    let width = chartSectionWidth
    let height = chartSectionHeight
    let group = svg.select("g");

    if (group.empty()) {
      group = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
    }
    const circleId = (d) => trimNames(d.PLATFORM + d.ARTIST_NAME);

    let circles = group.selectAll("circle.back").data(data, circleId);

    //background circle: the normally toned ones
    circles.join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "back")
          .style("pointer-events", "all")
          .attr("id", (d) => d.PLATFORM + d.ARTIST_NAME)
          .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 160))
          .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 160))
          .attr("r", (d) => d.r - 0.25)
          // .attr("fill", (d, i) => {
          //   // console.log(trimNames(d.ARTIST_NAME) + "_img");
          //   return `url(#${trimNames(d.ARTIST_NAME) + "_img"})`;
          // })
          .attr("fill", (d, i) => colorScale(d.PLATFORM))
          .attr("stroke", (d) => "lightgrey")
          .attr("stroke-width", (d) => 3)
          .call((enter) =>
            enter
              .transition()
              .ease(d3.easeCubicOut)
              .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
              .duration(1000)
              .attr("cx", (d) => d.x)
              .attr("cy", (d) => d.y)
          ), // animate to the correct radius
      (update) =>
        update.call((update) =>
          update
            .transition()
            .duration(1000)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", (d) => d.r)
            .attr("fill", (d, i) => colorScale(d.PLATFORM))
        ), // update existing circles
      (exit) => exit.transition().duration(1000).attr("r", 0).remove() // remove old circles
    );

    // The front circles: the dyed ones
    circles = group.selectAll("circle.front").data(data, circleId);
    circles.join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "front circle-1-5")
          .style("pointer-events", "all")
          .attr("id", (d) => d.PLATFORM + d.ARTIST_NAME)
          .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 160))
          .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 160))
          .attr("r", (d) => d.r - 0.25)
          .attr("fill", (d, i) => `url(#${trimNames(d.ARTIST_NAME) + "_img"})`)
          .attr("stroke", (d) => "white")
          .attr("stroke-width", (d) => 3)
          .call((enter) =>
            enter
              .transition()
              .ease(d3.easeCubicOut)
              .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
              .duration(1000)
              .attr("cx", (d) => d.x)
              .attr("cy", (d) => d.y)
              .style("mix-blend-mode", "luminosity")
          ), // animate to the correct radius
      (update) =>
        update.call((update) =>
          update
            .attr("class", "circle-1-5")
            .attr(
              "fill",
              (d, i) => `url(#${trimNames(d.ARTIST_NAME) + "_img"})`
            )
            .style("mix-blend-mode", "luminosity")
            .transition()
            .duration(1000)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", (d) => d.r)
        ), // update existing circles
      (exit) => exit.transition().duration(1000).attr("r", 0).remove() // remove old circles
    );
  }

  createOrUpdateChart(realData, type);
  return {
    update: (realData, newType) => {
      createOrUpdateChart(realData, newType);
    },
  };
}
