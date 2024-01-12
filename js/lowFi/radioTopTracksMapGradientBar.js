async function draw() {
  // parameters
  let dataUrl = "./data/gradientBarAP2_3.csv";
  let chartContainerId = "radioTopTracksMap_gradientBar";
  let widthKey = "SPINS";
  /***********************
   *1. Access data
   ************************/

  let data = await d3.csv(dataUrl);
  data.forEach((d) => {
    d.SPINS = +d.SPINS;
    d.MAX_SPINS = +d.MAX_SPINS;
  });
  data = data.sort((a, b) => d3.descending(a[widthKey], b[widthKey])); // .sort((a, b) => d3.descending(a.SPINS, b.SPINS));

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
  const wrapper = d3.select(visElement);
  
  // Select the top 10 rows using d3.slice
  const top10 = data.slice(0, 10);
  console.log(data)
  /***********************
   *4. Create scales
   ************************/
  const widthScale = d3
    .scaleLinear()
    .domain([0, d3.max(top10, (d) => d[widthKey])])
    .range([200, dimensions.boundedWidth]);

  const barContainers = wrapper.selectAll("div").data(top10);
  const newElements = barContainers
    .join("div")
    .attr("class", "gradient-bar")
    .on("mouseenter", function (event,d) {
      console.log(d)
    })
  newElements.html(function (d) {
    return `
      <img src="https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/1.jpg" alt="${d.Group}" class="artist-image">
      <span class="artist-name">${d.TRACK_NAME}</span>
    `;
  });
  newElements
    .style("padding", "3px")
    .style("margin", "1px")
    .style("width", (d) => widthScale(d[widthKey]) + "px");
  //  .style("background", "steelblue")
  //  .style("padding", "3px")
  //  .style("margin", "1px")
  //  .style("width", (d,i) => widthScale(d[widthKey]) + "px")
}

draw();
