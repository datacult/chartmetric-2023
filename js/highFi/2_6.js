// TODO: step 1
// 拿到当前dimension，发给calendarComponent,初始化
// TODO: step 2
// 当dimension变化时，更新calendarComponent和photoCard
function formatAlbumDate(str) {
  let date = new Date(str);
  let options = {month:"long",day: "numeric"};
  let formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate
}
import { CalendarComponent } from "../../components/CalendarComponent.js";
import { chartDimensions, setupResponsiveDimensions } from "../utility.js";
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

  const svg = wrapper
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")

    .attr("style", "max-width: 100%");

  const photoData = [
    { date: "2023-02-24", name: "Cupid", artist: "FIFTY FIFTY" },
    {
      date: "2023-03-17",
      name: "Ella Baila Sola",
      artist: "Eslabon Armado and Peso Pluma",
    },
    { date: "2023-05-18", name: "Padam Padam", artist: "Kylie Minogue" },
    { date: "2023-07-28", name: "Back on 74", artist: "Jungle" },
    {
      date: "2023-09-13",
      name: "Will Anybody Ever Love Me?",
      artist: "Sufjan Stevens",
    },
    { date: "2023-12-08", name: "FTCU", artist: "Nicki Minaj" },
  ];
  // individual photo
  const photoCard = d3
    .select("#viz_2_6")
    .append("div")
    .attr("id", "rotatingPhotos")
    .selectAll(".photo-card")
    .data(photoData)
    .join("div")
    .attr("class", "photo-card")

  const imageContainer = photoCard
    .append("div")
    .attr("class", "image-container")
    .style("transform", function () {
      let min = -25
      let max = 25
      // Generate a random rotation angle between -20 and 20 degrees for each photo frame
      const angle = Math.floor(Math.random() * (max - min + 1)) + min;
      return `rotate(${angle}deg)`;
    })
    .append("img");

  const textContainer = photoCard.append("div").attr("class", "text-container");
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

    photoCard.style("top", ({ date, name },i) => {
      const d = new Date(date);

      let manualGapBetweenCards = 0;
      if (i ==1) {
        manualGapBetweenCards = 20;
      }
      let value =
       ( d3.utcMonday.count(d3.utcYear(d), d3.utcMonday.floor(d))-2) *
        (cellSize +paddingBetweenCells*.5) +manualGapBetweenCards;
      return value + "px";
    });
    imageContainer
      .style("width", cellSize * 2.5 + "px")
      .style("height", cellSize * 2.5 + "px")


    // image
    imageContainer.attr("src", "https://tse3-mm.cn.bing.net/th/id/OIP-C.mv0hS6FHQ0D4A5hey74wNAHaHa?rs=1&pid=ImgDetMain").attr("alt", "Photo");

    // text next to photo
    textContainer.html(d=>`
    <div class='track-name'>"${d.name}"</div>
    <div class='artist-name'>${d.artist}</div>
    <hr>
    <div class='date'>${formatAlbumDate(d.date)}</>`);
  }

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
