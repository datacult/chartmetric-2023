function formatPercentage(number) {
  // Use d3.format to format the number as a percentage with one significant figure
  const formatter = d3.format(".1%");
  return formatter(number);
}
export async function draw() {
  let dataUrl = "./data/viz2-3.csv";

  /***********************
   *1. Access data
   ************************/

  let data = await d3.csv(dataUrl);

  data.forEach((d) => {
    d.FOLLOWERS_2023_PROPORTION = +d.FOLLOWERS_2023_PROPORTION;
  });
  // Select the container
  let platformsContainer = d3.select("#platforms-container");

  // Platforms to loop through and create columns
  let platforms = ["Tiktok", "Instagram", "Youtube"];

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
    // console.log(platformData.map((d) => d.COUNTRY_NAME));
    // Create a column for each platform
    let column = platformsContainer
      .append("div")
      .attr("class", `column ${platform.toLowerCase()}`);

    // Append a div for each country within the sorted data
    platformData.forEach((d, i) => {
      let countryRow = column
        .append("div")
        .attr("class", "country-row")
        .style("background-color", () => {
          return colorScale(d.PLATFORM);
        });
      countryRow
        .append("span")
        .attr("class", "country-name")
        .text(i + 1 + ". " + d.COUNTRY_NAME);
      countryRow
        .append("span")
        .attr("class", "country-value")
        .text(formatPercentage(d.FOLLOWERS_2023_PROPORTION));
    });
  });

 

  // Add event listeners
  d3.selectAll(".country-row").on("mouseover", function () {
    // 'this' refers to the hovered element
    // find the hovered country name
    let hoveredCountryRow = d3.select(this).select(".country-name").text();
    // extrac that name
    const hoveredCountryName = hoveredCountryRow.replace(/^\d+\.\s*/, "");
    d3.selectAll(".country-row").each(function () {
      // check all the country rows to see if they have the same country name
      if (
        d3
          .select(this)
          .select(".country-name")
          .text()
          .includes(hoveredCountryName)
      ) {
        // if they do, give them `highlighted` class
        d3.select(this).classed("highlighted", true);
      }
    });
  });

  d3.selectAll(".country-row").on("mouseout", function () {
    d3.selectAll(".country-row").classed("highlighted", false);
  });
}


