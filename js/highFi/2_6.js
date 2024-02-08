// TODO: step 1
// 拿到当前dimension，发给calendarComponent,初始化
// TODO: step 2
// 当dimension变化时，更新calendarComponent和photoCard
function formatAlbumDate(str) {
  let date = new Date(str);
  let options = { month: "long", day: "numeric" };
  let formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate
}
import { CalendarComponent } from "../../components/CalendarComponent.js";
import { chartDimensions, setupResponsiveDimensions } from "../utility.js";
import { calendarsummary } from "../calendar_summary.js";

export function Calendar(data, selector, chartContainerId = "calendarHeatmap") {

  d3.select("#" + selector)
    .append("div")
    .attr("id", "calendarHeatmap");

  let xKey = "RELEASE_DATE";
  let yKey = "DAILY_TRACK_RELEASE_COUNT";
  /***********************
   *1. Access data
   ************************/

  data.forEach((element) => {
    element[xKey] = new Date(element[xKey]);
    element[yKey] = +element[yKey];
  });
  let dataset = data;

  /***********************
   *2. Create chart dimensions
   ************************/
  // Get the element by its ID
  const visElement = document.getElementById(chartContainerId);

  // Get the bounding rectangle of the element

  console.log(chartContainerId);
  const dimensions = chartDimensions(chartContainerId);
  /***********************
   *3. Set up canvas
   ************************/
  // Create the SVG container.
  const wrapper = d3.select(visElement);

  d3.csv('https://share.chartmetric.com/year-end-report/2023/viz_2_6_2_en.csv', d3.autoType).then(summaryData => {

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    // replace month number with month name
    summaryData.forEach(d => {
      d["RELEASE_MONTH"] = months[d["RELEASE_MONTH"] - 1]
    })

    let summary_map = {
      fill: "MONTHLY_TRACK_RELEASE_COUNT",
      date: "RELEASE_MONTH",
      label: "MONTHLY_TRACK_RELEASE_COUNT"
    }

    if (!d3.select("#" + selector + "_summary").empty()) {
      let summary = calendarsummary(summaryData, summary_map, { selector: "#" + selector + "_summary" })
    }
  });

  const svg = wrapper
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("style", "max-width: 100%");

  let photoCard, imageContainer, textContainer;

  d3.csv('https://share.chartmetric.com/year-end-report/2023/viz_2_6_1_en.csv', d3.autoType).then(photoData => {

    const rotateScale = d3.scaleLinear().domain([0, 100]).range([-15, 15]);

    // individual photo
    photoCard = d3
      .select("#viz_2_6")
      .append("div")
      .attr("id", "rotatingPhotos")
      .selectAll(".photo-card")
      .data(photoData)
      .join("div")
      .attr("class", "photo-card")

    imageContainer = photoCard
      .append("div")
      .attr("class", "image-container")
      .style("transform", function () {
        let min = -25
        let max = 25
        // Generate a random rotation angle between -20 and 20 degrees for each photo frame
        const angle = Math.floor(Math.random() * (max - min + 1)) + min;
        return `rotate(${angle}deg)`;
      })
      .on("mousemove", function (event, d) {
        d3.select(this).style("transform", `rotate(${rotateScale(event.offsetX)}deg)`);
      })
      .append("img");

    textContainer = photoCard.append("div").attr("class", "text-container");

  });

  function update(data, updatedDimensions) {
    let cellSize = updatedDimensions.width / 7;
    let paddingBetweenCells = 5;
    CalendarComponent(svg, data, {
      x: (d) => d["RELEASE_DATE"],
      y: (d) => d["DAILY_TRACK_RELEASE_COUNT"],
      dimensions: updatedDimensions,
      colors: ["#DFF3DB", "#0769AC"],
      cellSize: cellSize,
      paddingBetweenCells: paddingBetweenCells,
    });

    if (photoCard) photoCard.style("top", (d, i) => {
      const date = new Date(d.RELEASE_DATE);

      let manualGapBetweenCards = 0;
      if (i == 1) {
        manualGapBetweenCards = 20;
      }
      let value =
        (d3.utcMonday.count(d3.utcYear(date), d3.utcMonday.floor(date)) - 2) *
        (cellSize + paddingBetweenCells * .5) + manualGapBetweenCards;
      return value + "px";
    });

    if (imageContainer) imageContainer
      .style("width", cellSize * 2.5 + "px")
      .style("height", cellSize * 2.5 + "px")
      .attr("src", d => d.IMAGE_URL)
      .attr("alt", "Photo");

    // text next to photo
    if (textContainer) textContainer.html(d => {
      return `<div class='track-name'>${d.NAME}</div>
    <div class='artist-name'>${d.ANNOTATION}</div>
    <hr>
    <div class='date'>${formatAlbumDate(d.RELEASE_DATE)}</>`
    });

  };

  update(dataset, dimensions);


  setupResponsiveDimensions(
    chartContainerId,
    { top: 10, right: 20, bottom: 10, left: 60 },
    (updatedDimensions) => {
      console.log(updatedDimensions);
      // if there is elements, meaning charts already exist
      if (!d3.select("#" + chartContainerId).empty()) {
        update(dataset, updatedDimensions);
      }
    }
  );
  return {
    update: update,
  };
}
