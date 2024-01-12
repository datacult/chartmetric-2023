async function draw() {
  let dataUrl = "./data/viz2-3.csv";
  let chartContainerId = "calendarHeatmap";

  /***********************
   *1. Access data
   ************************/

  let data = await d3.csv(dataUrl);
  console.log(data);
  data.forEach((d) => {
    d.FOLLOWERS_2023_PROPORTION = +d.FOLLOWERS_2023_PROPORTION;
  });
  // Select the container
  let platformsContainer = d3.select("#platforms-container");

  // Platforms to loop through and create columns
  let platforms = ["Youtube", "Instagram", "Tiktok"];

  const colorScale = d3.scaleOrdinal(platforms, [
    "#E7F0ED",
    "#E1E8EE",
    "#F1E5F3",
  ]);
  platforms.forEach((platform) => {
    // Filter and sort data based on the platform
    let platformData = data
      .filter((d) => d.PLATFORM.toLowerCase() === platform.toLowerCase())
      .sort(
        (a, b) => b.FOLLOWERS_2023_PROPORTION - a.FOLLOWERS_2023_PROPORTION
      );
    console.log(platformData.map((d) => d.COUNTRY_NAME));
    // Create a column for each platform
    let column = platformsContainer
      .append("div")
      .attr("class", `column ${platform.toLowerCase()}`);
    column.append("div").attr("class", "column-header").text(platform);
    // Append a div for each country within the sorted data
    platformData.forEach((d, i) => {
      let countryRow = column
        .append("div")
        .attr("class", "country-row")
        .style("background-color", () => {
          return colorScale(d.COUNTRY_NAME);
        });
      countryRow
        .append("span")
        .attr("class", "country-rank")
        .text(i + 1 + ". ");
      countryRow
        .append("span")
        .attr("class", "country-name")
        .text(d.COUNTRY_NAME);
    });
  });

  // Function to add and remove highlight class
  function highlightCountries(countryName, addHighlight) {
    d3.selectAll(".country-name").each(function () {
      if (d3.select(this).text() === countryName) {
        // The parent node is the .country-row div
        d3.select(this.parentNode).classed("highlighted", addHighlight);
      }
    });
  }

  // Add event listeners
  d3.selectAll(".country-name").on("mouseover", function () {
    // 'this' refers to the hovered element
    let countryName = d3.select(this).text();
    highlightCountries(countryName, true);
  });

  d3.selectAll(".country-name").on("mouseout", function () {
    // 'this' refers to the hovered element
    let countryName = d3.select(this).text();
    highlightCountries(countryName, false);
  });
}

draw();
