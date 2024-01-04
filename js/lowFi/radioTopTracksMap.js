async function draw() {
  // parameters
  let dataUrl = "./data/world.json";
  let chartContainerId = "radioTopTracksMap_worldMap";
  /***********************
   *1. Access data
   ************************/

  const world = await d3.json(dataUrl);
  const countries = topojson.feature(world, world.objects.countries);
  const countrymesh = topojson.mesh(
    world,
    world.objects.countries,
    (a, b) => a !== b
  );
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
    .attr("fill", (d) => "#E4E4E4")
    .attr("d", path)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);
}

draw();
