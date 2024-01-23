import { chartDimensions, trimNames} from "../utility.js";
let selectedCountries = ["Italy"];
export async function drawMap(selectedCountries = []) {
  // parameters
  let dataUrl = "./data/world.json";
  let trackDataUrl = "./data/gradientBarAP2_3.csv";
  let chartContainerId = "radioTopTracksMap_worldMap";
  let hoveredMapSelector = null;
  /***********************
   *1. Access data
   ************************/
  const world = await d3.json(dataUrl);

  const countries = topojson.feature(world, world.objects.countries);

  //
  let dataset = await d3.csv(trackDataUrl, d3.autoType);

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
  const projection = d3
    .geoMiller()

    .fitSize([dimensions.boundedWidth, dimensions.boundedHeight], countries);
  const path = d3.geoPath(projection);

  // Create the SVG container.
  const svg = d3
    .select("svg")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .attr("viewBox", [0, 0, dimensions.boundedWidth, dimensions.boundedHeight])
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
      } else {
        return "#E3E0D7";
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
      const tracksWithLargestSpins = d3.rollup(
        filteredData,
        (v) => d3.max(v, (d) => d.SPINS),
        (d) => d.TRACK_NAME
      );
      let hoveredTrackName =
        [...tracksWithLargestSpins.entries()].length > 0
          ? [...tracksWithLargestSpins.entries()][0][0]
          : "noData";

      let hoveredTrackNameID = trimNames(hoveredTrackName)


      hoveredMapSelector = `div#${hoveredTrackNameID}.gradient-bar`;

      d3.select(hoveredMapSelector).style("border", "1px solid black");

      //
    
      const [x, y] = d3.pointer(event);
      if (filteredData.length > 0) {
        d3
          .select(".map-tooltip")
          .style("display", "flex")
          .style("left", x + 1 + "px")
          .style("top", y + 10 + "px").html(`
        <div class="map-tooltip__country">${filteredData[0].NAME}<span class="flag"> </span></div>
        <div class="map-tooltip__track"><span class="flag"></span>${filteredData[0].TRACK_NAME}</div>
        <div class="map-tooltip__artist"><span class="flag"></span>${filteredData[0].ARTIST_NAME}</div>
    `);
      }
    })
    .on("mouseleave", function (event, d) {
      d3.select(hoveredMapSelector).style("border", "0px solid black");
      d3.select(".map-tooltip").style("display", "none");
    });
}
drawMap(selectedCountries);
