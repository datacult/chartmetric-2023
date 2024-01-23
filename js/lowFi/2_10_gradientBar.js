import { chartDimensions, trimNames } from "../utility.js";
import { drawMap } from "./2_10_Map.js";
export async function gradientBarMapComponent(dataset, chartContainerId) {

  let widthKey = "SPINS";
  let yKey = "TRACK_NAME";

  /***********************
   *1. Access data
   ************************/

  dataset = dataset.sort((a, b) => d3.descending(a[widthKey], b[widthKey]));
  // Select the top 10 tracks
  const top10TrackNames = [...new Set(dataset.map((d) => d[yKey]))].slice(
    0,
    10
  );

  const top10 = dataset.filter((d) => top10TrackNames.includes(d.TRACK_NAME));

  /***********************
   *2. Create chart dimensions
   ************************/
  // Get the element by its ID
  const visElement = document.getElementById(chartContainerId);

  const dimensions = chartDimensions(chartContainerId);

  /***********************
   *3. Set up canvas
   ************************/
  const wrapper = d3.select(visElement);

  /***********************
   *4. Create scales
   ************************/

  const top10Group = d3.groups(top10, (d) => d[yKey]);
  const top10GroupSummarized = top10Group.map(([key, values]) => ({
    [yKey]: key,
    [widthKey]: d3.sum(values, (d) => d[widthKey]),
    data: values,
  }));
  const widthScale = d3
    .scaleLinear()
    .domain([0, d3.max(top10GroupSummarized, (d) => d[widthKey])])
    .range([200, dimensions.boundedWidth]);

  const yScale = d3
    .scaleBand()
    .domain(top10TrackNames)
    .range([0, dimensions.boundedHeight])
    .paddingInner(0.2);

  const barContainers = wrapper.selectAll("div").data(top10GroupSummarized);
  const newElements = barContainers
    .join("div")
    .attr("class", "gradient-bar")
    .attr(
      "id",
      (d) => trimNames(d[yKey])
      // .replace(/[^a-zA-Z0-9-_]/g, "") // Remove special characters
      // .replace(/\s/g, "_") // Replace spaces with underscores
      // .replace(/\(|\)/g, "")
    )
    .on("click", function (event, d) {
      drawMap(d.data.map((d) => d.NAME), chartContainerId);
    })
    .on("mouseenter", function (event, d) {
      d3.select(this).style("border", "1px solid black");

      d3.select(this).append("div").attr("class", "tooltip").html(`
      <div class='name'>${d.data[0].ARTIST_NAME}</div>
      <div class="flag"> </div>
      <div class="card-stack">
        <div class="card">R&B/Soul</div>
        <div class="card">Jazz</div>
        <div class="card">Pop</div>
      </div>`);
      let fromRight = d3
        .select(".tooltip")
        .node()
        .getBoundingClientRect().width;
      gsap.fromTo(
        ".tooltip",
        { left: -fromRight, opacity: 0 },
        { left: 0, opacity: 1, duration: 0.5, ease: "power2.inOut" }
      );
    })
    .on("mouseleave", function (d) {
      d3.select(this).select("div.tooltip").remove();
      d3.select(this).style("border", "0px solid black");
    });

  let imageWidth = yScale.bandwidth() * 0.75;

  newElements.html(function (d) {
    return `
      <img src="https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/1.jpg" alt="${d[yKey]}" class="artist-image" 
      style="width:${imageWidth}px; height:${imageWidth} px">
      <div class="artist-name"><span>${d[yKey]}</span></div>
    `;
  });
  newElements
    .style("padding", "3px")
    .style("margin", "1px")
    .style("width", (d) => {
      return widthScale(d.data[0][widthKey]) + "px";
    })
    .style("transform", (d, i) => `translateY(${yScale(d[yKey])}px)`);

  //  .style("background", "steelblue")
  //  .style("padding", "3px")
  //  .style("margin", "1px")
  //  .style("width", (d,i) => widthScale(d[widthKey]) + "px")
}

export async function gradientBarMap(chartContainerId) {
  // await loadData();
  await gradientBarMapComponent(chartContainerId);
  // setupResizeListener(gradientBarMapComponent,chartContainerId);

  // return (chartContainerId) => gradientBarMapComponent(chartContainerId);
}
