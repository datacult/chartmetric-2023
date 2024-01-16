let selectedCountries = ["Italy"];
export async function drawMap(selectedCountries = []) {
  // parameters
  let dataUrl = "./data/world.json";
  let trackDataUrl = "./data/gradientBarAP2_3.csv";
  let chartContainerId = "radioTopTracksMap_worldMap";
  let hoveredTrackName = null;
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
  const rect = visElement.getBoundingClientRect();
  let dimensions = {
    width: rect.width,
    height: rect.height,
    margin: {
      top: 0,
      right: 10,
      bottom: 0,
      left: 0,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  /***********************
   *3. Set up canvas
   ************************/
  const projection = d3
    .geoNaturalEarth2()
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
      console.log(mapData.properties.name)
      let filteredData = dataset.filter(
        (d) => d.NAME === mapData.properties.name
      );
      // use d3.least
      const tracksWithLargestSpins = d3.rollup(
        filteredData,
        (v) => d3.max(v, (d) => d.SPINS),
        (d) => d.TRACK_NAME
      );
      hoveredTrackName = [...tracksWithLargestSpins.entries()].length > 0 ?[...tracksWithLargestSpins.entries()][0][0] : 'noData'
      
      let hoveredTrackNameID = hoveredTrackName
        .replace(/[^a-zA-Z0-9-_]/g, "") // Remove special characters
        .replace(/\s/g, "_") // Replace spaces with underscores
        .replace(/\(|\)/g, "");
        console.log(hoveredTrackNameID)
        d3.select("#" + hoveredTrackNameID).style("border", "38px solid black;"); 
     console.log( d3.select("#" + hoveredTrackNameID))
    })
    .on("mouseout", function (event, d) {
      hoveredTrackName = null;
    });
  return hoveredTrackName;
}
