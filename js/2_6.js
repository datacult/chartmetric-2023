// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { calendarsummary } from "./calendar_summary.js";

export function viz_2_6(data, map, options) {

  console.log(data)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    fill: null,
    stroke: null,
    value: 'value',
    date: 'date',
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 500,
    height: 1500,
    margin: { top: 100, right: 50, bottom: 50, left: 50 },
    transition: 400,
    delay: 100,
    padding: 0,
    fill: "#69b3a2",
    stroke: "#000",
    imageSize: 80
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ///////////////////////////////////////
  //////////// Summary Viz //////////////
  ///////////////////////////////////////

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

  if (!d3.select(options.selector + "_summary").empty()) {
    let summary = calendarsummary(summaryData, summary_map, { selector: options.selector + "_summary" })
  }
});

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const div = d3.select(options.selector);

  const container = div.append('div')
    .classed('vis-svg-container', true);

  const svg = container.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .classed('vis-svg', true)
    .append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

  const tooltip = d3.select(options.selector)
    .append("div")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("background-color", "white")
    .classed("tooltip", true);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Transform ///////////////
  ////////////////////////////////////////

  // filter to year
  data = data.filter(d => new Date(d[map.date]).getFullYear() == 2023);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function getDayDetails(date) {
    const dow = date.getDay();
    const dom = date.getDate();
    const month = date.getMonth() + 1;
    const mo = Math.ceil(dom / 7);
    let startOfYear = new Date(date.getFullYear(), 0, 1);
    let numberOfDays = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    let weekNumber = Math.ceil((numberOfDays + startOfYear.getDay() + 1) / 7);

    return { dow: daysOfWeek[dow], dom, mo, month, weekNumber };
  }

  // Process the data
  data = data.map(d => {
    const date = new Date(d[map.date]);
    const { dow, mo, dom, weekNumber, month } = getDayDetails(date);

    return {
      ...d,
      dow,
      dom,
      mo,
      weekNumber,
      month
    };
  });

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(daysOfWeek)
    .range([0, width / 2])
    .padding(options.padding)

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.weekNumber).sort((a, b) => a > b ? 1 : -1))
    .range([0, height])
    .padding(options.padding)

  const colorScale = d3.scaleSequential(d3.interpolateGnBu)
    .domain(d3.extent(data, d => d[map.value]))

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const square = svg.selectAll(".square")
    .data(data)
    .join("rect")
    .attr('x', d => xScale(d.dow))
    .attr('y', d => yScale(d.weekNumber))
    .attr('width', d => xScale.bandwidth())
    .attr('height', d => yScale.bandwidth())
    .attr("fill", d => map.value != null ? colorScale(d[map.value]) : options.fill)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .classed('square', true)
    .on('mouseover', (event, d) => {

      tooltip
        .style("opacity", 1)
        .html(`<p>${d[map.date]}</p><p>${d[map.value]}</p>`)
        .style("left", (event.clientX) + "px")
        .style("top", (event.clientY) + "px");
    })
    .on('mouseout', (event, d) => {
      tooltip
        .style("opacity", 0)
    });

  console.log(data.filter(d => d.mo == 1));

  const top_month_line = svg.selectAll(".month-line")
    .data(data.filter(d => d.mo == 1))
    .join("line")
    .attr('x1', d => xScale(d.dow))
    .attr('x2', d => xScale(d.dow) + xScale.bandwidth())
    .attr('y1', d => yScale(d.weekNumber))
    .attr('y2', d => yScale(d.weekNumber))
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('stroke-linecap', 'round')
    .classed('month-line', true);

  const left_month_line = svg.selectAll(".end-month-line")
    .data(data.filter(d => d.dom == 1 && d.dow != "sunday"))
    .join("line")
    .attr('x1', d => xScale(d.dow))
    .attr('x2', d => xScale(d.dow))
    .attr('y1', d => yScale(d.weekNumber))
    .attr('y2', d => yScale(d.weekNumber) + yScale.bandwidth())
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('stroke-linecap', 'round')
    .classed('end-month-line', true);

  ////////////////////////////////////////
  ////////////// Axes ////////////////////
  ////////////////////////////////////////

  svg.append("g")
    .attr("transform", `translate(0,${-20})`)
    .call(d3.axisTop(xScale));

  svg.selectAll(".tick text")
    .attr("transform", "rotate(90)")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end");

  svg.selectAll(".domain").remove();
  svg.selectAll(".tick line").remove();

  d3.csv('https://share.chartmetric.com/year-end-report/2023/viz_2_6_1_en.csv', d3.autoType).then(photoData => {

    // Process the data
    photoData = photoData.map(d => {
      const date = new Date(d[map.date]);
      const { dow, mo, dom, weekNumber, month } = getDayDetails(date);

      return {
        ...d,
        dow,
        dom,
        mo,
        weekNumber,
        month
      };
    });

    console.log(photoData)

    // add images
    const rotateScale = d3.scaleLinear().domain([0, 100]).range([-15, 15]);

    let photoCard = svg
      .selectAll(".artwork")
      .data(photoData)
      .join("svg:image")
      .attr("xlink:href", d => d["IMAGE_URL"])
      .attr("x", d => (width / 2) + 10)
      .attr("y", d => yScale(d.weekNumber))
      .attr("width", options.imageSize)
      .attr("height", options.imageSize)
      .style("outline", options.imageSize * 0.05 + "px solid white")
      .attr("transform", d => `rotate(${rotateScale(Math.random() * 100)})`)
      .attr("transform-origin", d => `${(width / 2) + 10 + options.imageSize / 2} ${yScale(d.weekNumber) + options.imageSize / 2}`)
      .attr("class", "artwork")
      .on("mousemove", function (event, d) {
        square.filter(x => x[map.date] == d[map.date]).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mouseout", function (event, d) {
        square.attr("stroke", "white").attr("stroke-width", 0.5);
      });

    svg
      .selectAll(".artist_name")
      .data(photoData)
      .join("text")
      .attr("x", (width / 2) + 20 + options.imageSize)
      .attr("y", d => yScale(d.weekNumber) + options.imageSize / 2)
      .text(d => d["NAME"])
      .append("tspan")
      .attr("x", (width / 2) + 20 + options.imageSize)
      .attr("dy", "1.2em")
      .text(d => d["ANNOTATION"])
      .classed("artist_name", true);




  })


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition)

  }

  // call for initial bar render
  update(data)

  return {
    update: update,
  }

};
