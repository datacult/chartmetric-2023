import { chartDimensions, trimNames } from "../utility.js";
let selectedCountries = ["Italy"];
export async function drawMap(
  selectedCountries = [],
  chartContainerId = "radioTopTracksMap_worldMap"
) {
  let dataUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  let trackDataUrl =
    "https://share.chartmetric.com/year-end-report/2023/viz_2_10_en.csv";
  let hoveredMapSelector = null;
  /***********************
   *1. Access data
   ************************/
  const world = await d3.json(dataUrl);
  const flagData = await d3.json('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')

  const countries = topojson.feature(world, world.objects.countries);

  // key comes from data, value comes from the map
  const nameMap = {
    "United States": "United States of America",
    Türkiye: "Turkey",
    "Dominican Republic": "Dominican Rep.",
    "Russian Federation": "Russia", // or just "Russia" if that's how it's named in your data
    "Czech Republic": "Czechia",
    // Add more mappings as needed
  };

  let data = await d3.csv(trackDataUrl, d3.autoType);
  let dataset = data.map((entry) => ({
    ...entry,
    NAME: nameMap[entry.NAME] || entry.NAME,
  }));

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
  const scaleFactor = 0.85; // Adjust this value to control the zoom
  const centerX = dimensions.boundedWidth / 2;
  const centerY = dimensions.boundedHeight / 2;
  const zoomedWidth = dimensions.boundedWidth * scaleFactor;
  const zoomedHeight = dimensions.boundedHeight * scaleFactor;

  const projection = d3
    .geoFahey()
    .fitSize([dimensions.boundedWidth, dimensions.boundedHeight], countries)
    .translate([centerX, centerY]);

  const path = d3.geoPath(projection);

  // Create the SVG container.
  const svg = d3
    .select("#radioTopTracksMap_worldMap_svg")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .attr(
      "viewBox",
      `${centerX - zoomedWidth / 2} ${centerY - zoomedHeight / 2
      } ${zoomedWidth} ${zoomedHeight}`
    )
    .attr("style", "max-width: 100%; height: 100%;");

  // Add a path for each country and color it according te this data.
  svg
    .append("g")
    .selectAll("path")
    .data(countries.features)
    .join("path")
    .attr("id", "radioTopTracksMap_path")
    .attr("fill", (d) => {
      if (selectedCountries.includes(d.properties.name)) {
        return "#193C3B";
      } else if (
        [...new Set(dataset.map((d) => d.NAME))].includes(d.properties.name)
      ) {
        return "#C8D7D5";
      } else {
        return "#DAE2E1";
      }
    })
    .attr("class", (d) => {
      if (
        [...new Set(dataset.map((d) => d.NAME))].includes(d.properties.name)
      ) {
        return "";
      } else {
        return "noData_Map";
      }
    })
    .attr("d", path)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .on("mouseenter", function (event, mapData) {
      let filteredData = dataset.filter(
        (d) => d.NAME === mapData.properties.name
      );
      // use d3.least
      // const tracksWithLargestSpins = d3.rollup(
      //   filteredData,
      //   (v) => d3.max(v, (d) => d.SPINS),
      //   (d) => d.TRACK_NAME
      // );
      // let hoveredTrackName =
      //   [...tracksWithLargestSpins.entries()].length > 0
      //     ? [...tracksWithLargestSpins.entries()][0][0]
      //     : "noData";
      const hoveredTrackName =
        d3.least(filteredData, (d) => d.SPINS)?.TRACK_NAME || "noData";

      let hoveredTrackNameID = trimNames(hoveredTrackName);

      hoveredMapSelector = `div#${hoveredTrackNameID}.gradient-bar`;

      d3.select(hoveredMapSelector).style("border", "1px solid black");

      const [x, y] = d3.pointer(event);
      if (filteredData.length > 0) {
        console.log(filteredData[0])
        d3
          .select(".map-tooltip")
          .style("display", "flex")
          .style("left", x + 1 + "px")
          .style("top", y + 15 + "px").html(`
        <div class="map-tooltip__country"><span class="flag">${flagData.find(x => x.name == filteredData[0].NAME).emoji}</span>${filteredData[0].NAME}</div>
        <div class="map-tooltip__track"><span class="tooltip__artwork"><img class="tooltip__artwork_img" src="${filteredData[0].IMAGE_URL}"><img/></span>${filteredData[0].TRACK_NAME}</div>
        <div class="map-tooltip__artist"><span class="tooltip__artist"></span>${filteredData[0].ARTIST_NAME}</div>
    `);
      }
    })
    .on("mouseleave", function (event, d) {
      d3.select(hoveredMapSelector).style("border", "0px solid black");
      d3.select(".map-tooltip").style("display", "none");
    })
    .on("click", function (event, mapData) {
      let filteredData = dataset.filter(
        (d) => d.NAME === mapData.properties.name
      );
      const hoveredTrackName =
        d3.least(filteredData, (d) => d.SPINS)?.TRACK_NAME || "noData";
      let hoveredTrackNameID = trimNames(hoveredTrackName);
     

      //! Below scrolls , but moves the whole thing.
      // document.getElementById( hoveredTrackNameID).scrollIntoView({
      //   behavior: "smooth", // Use smooth scrolling for a smoother effect (optional)
      //   block: "start", // Scroll to the top of the target element (you can change this)
      // });
      document.getElementById("radioTopTracksMap_gradientBar").scrollTo({
        top: document.getElementById(hoveredTrackNameID).offsetTop,
        behavior: "smooth", // Use smooth scrolling for a smoother effect (optional)
      })
    });
}
// drawMap(selectedCountries);
