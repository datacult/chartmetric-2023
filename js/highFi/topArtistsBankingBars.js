import { chartDimensions } from "../chartDimensions.js";
async function draw() {
  // parameters
  let dataUrl = "./data/A2-12.csv";
  let chartContainerId = "topArtistsBankingBars_barChart";
  let widthKey = "CM_SCORE";
  let selectedValue = "United States";
  /***********************
   *1. Access data
   ************************/

  let dataset = await d3.csv(dataUrl);
  dataset.forEach((d) => {
    d.CM_SCORE = +d.CM_SCORE;
  });
  dataset = dataset.sort((a, b) => d3.descending(a[widthKey], b[widthKey])); // .sort((a, b) => d3.descending(a.SPINS, b.SPINS));
  let countries_names = [...new Set(dataset.map((d) => d.COUNTRY_NAME))];
  countries_names.unshift("All Countries");
  // let data = dataset.filter((d) => d.COUNTRY_NAME == selectedValue);
  let data = dataset.slice(0, 10);

  // handle dropdown
  const dropdown = d3.select("#topArtistsBankingBars_countrydropdown");
  dropdown
    .select("select")
    .selectAll("option")
    .data(countries_names)
    .join("option")
    .attr("value", (d) => d)
    .text((d) => d);
  dropdown.on("change", onDropdownChange);
  function onDropdownChange(event) {
    // Access the selected value directly from the event object
    selectedValue = event.target.value;

    if (selectedValue == "All Countries") {
      data = dataset.slice(0, 10);
      drawCanvas(data);
    } else {
      data = dataset.filter((d) => d.COUNTRY_NAME == selectedValue);

      drawCanvas(data);
    }
  }
  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth: width, boundedHeight: height } =
    chartDimensions(chartContainerId);
  /***********************
   *3. Set up canvas
   ************************/
  const visElement = document.getElementById(chartContainerId);
  const wrapper = d3.select(visElement);

  // Select the top 10 rows using d3.slice

  const top10 = data.slice(0, 10);

  // console.log(data.filter((d) => d.COUNTRY_NAME == "United States")
  /***********************
   *4. Create scales
   ************************/
  const widthScale = d3
    .scaleLinear()
    .domain([0, d3.max(top10, (d) => d[widthKey])])
    .range([350, width]);

  /***********************
   *5. Draw canvas
   ************************/
  function drawCanvas(top10) {
    // Bind the data to the elements with a key function for object constancy
    const barContainers = wrapper
      .selectAll("div.bar")
      .data(top10, (d) => d.ARTIST_NAME);

    // Use join to handle enter, update, and exit selections
    barContainers.join(
      // Enter selection
      (enter) =>
        enter
          .append("div")
          .attr("class", "gradient-bar bar")
          .html(
            (d) => `
            <img style="width:${height / 18}px; height:${
              height / 18
            }px" src="https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/1.jpg" alt="${
              d.Group
            }" class="artist-image">
            <span class="artist-name">${d.ARTIST_NAME}</span>
          `
          )
          .style("opacity", 0)
          .style("width", 0)
          .transition()
          .duration(500)
          .style("opacity", 1)
          .style("width", (d) => widthScale(d[widthKey]) + "px"),

      // Update selection
      (update) =>
        update
          .transition()
          .duration(500)
          .style("width", (d) => widthScale(d[widthKey]) + "px"),

      // Exit selection
      (exit) =>
        exit
          .transition()
          .duration(500)
          .style("width", 0)
          .style("opacity", 0)
          .remove()
    );
  }

  drawCanvas(top10);
  //  .style("background", "steelblue")
  //  .style("padding", "3px")
  //  .style("margin", "1px")
  //  .style("width", (d,i) => widthScale(d[widthKey]) + "px")
}

draw();
