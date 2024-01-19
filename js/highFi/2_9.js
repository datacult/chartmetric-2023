import { chartDimensions } from "../chartDimensions.js";

export async function draw(dataUrl, chartContainerId, widthKey, selectedValue) {
  /***********************
   *1. Access data
   ************************/

  let dataset = await d3.csv(dataUrl, d3.autoType);

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
  const wrapper = d3.select(visElement);

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
  function drawCanvas(top10) {
    // Bind the data to the elements with a key function for object constancy
    const barContainers = wrapper
      .selectAll("div.bar")
      .data(top10, (d) => d.ARTIST_NAME);

    // Use join to handle enter, update, and exit selections
    barContainers
      .join(
        // Enter selection
        (enter) =>
          enter
            .append("div")
            .attr("class", "gradient-bar bar")
            .html(
              (d) => `
            <img style="width:${height / 18}px; height:${height / 18
                }px" src="https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/1.jpg" alt="${d.Group
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
      )
      .on("mouseenter", function (d) {
        d3.select(this).append("div").attr("class", "tooltip").html(`
        <div class='name'>Artist Name</div>
        <div class="flag"> </div>
        <div class="card-stack">
          <div class="card">R&B/Soul</div>
          <div class="card">Jazz</div>
          <div class="card">Pop</div>
        </div>`);
        let fromRight = d3.select('.tooltip').node().getBoundingClientRect().width;
        gsap.fromTo(
          ".tooltip",
          { right: -fromRight, opacity: 0 },
          { right: 0, opacity: 1, duration: 0.5, ease: "power2.inOut" }
        );
      })
      .on("mouseleave", function (d) {
        d3.select(this).select("div.tooltip").remove();
      });
  }

  if (selectedValue == "All Countries") {
    data = dataset.slice(0, 10);
    drawCanvas(data);
  } else {
    data = dataset.filter((d) => d.COUNTRY_NAME == selectedValue);

    drawCanvas(data);
  }
}
