// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

// Description: combined calendar heatmap and DIV based summary

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
    height: 1200,
    margin: { top: 100, right: 50, bottom: 50, left: 60 },
    transition: 1000,
    delay: 1500,
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

  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  d3.csv('https://share.chartmetric.com/year-end-report/2023/viz_2_6_2_en.csv', d3.autoType).then(summaryData => {

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
    .attr("id", options.selector.substring(1) + "_tooltip")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("background-color", "white")
    .classed("tooltip", true);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;
  const dateFormat = d3.utcFormat("%A - %B %d, %Y");

  ////////////////////////////////////////
  ////////////// Filters /////////////////
  ////////////////////////////////////////

  let defs = svg.append("defs");

  const filter = defs
    .append("filter")
    .attr("id", options.selector.substring(1) + "-drop-shadow")
    .attr("color-interpolation-filters", "sRGB");

  filter.append("feDropShadow")
    .attr("dx", "0")
    .attr("dy", "0")
    .attr("stdDeviation", "3")
    .attr("flood-opacity", "0.5");

  ////////////////////////////////////////
  ////////////// Transform ///////////////
  ////////////////////////////////////////

  // filter to year
  data = data.filter(d => new Date(d[map.date]).getUTCFullYear() == 2023);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function getUTCDayDetails(date) {
    const iso = date.toISOString();
    const dow = date.getUTCDay();
    const dom = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const mo = Math.ceil(dom / 7);
    let startOfYear = new Date(date.getUTCFullYear(), 0, 1);
    let numberOfDays = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    let weekNumber = Math.floor((numberOfDays + startOfYear.getUTCDay() + 1) / 7);

    return { iso, dow: daysOfWeek[dow], dom, mo, month, weekNumber };
  }

  // Process the data
  data = data.map(d => {
    const date = new Date(d[map.date]);
    const { iso, dow, mo, dom, weekNumber, month } = getUTCDayDetails(date);

    return {
      ...d,
      iso,
      dow,
      dom,
      mo,
      weekNumber,
      month
    };
  });

  console.log(data)

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(daysOfWeek)
    .range([0, width / 3])
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
    .attr("opacity", 0)
    .classed('square', true)
    .on('mouseover', (event, d) => {

      tooltip
        .style("display", "block")
        .html(`<p>${dateFormat(d[map.date])}</p><p>Daily Track Release Count: ${d3.format(",")(d[map.value])}</p>`)
        .style("left", (event.clientX) + "px")
        .style("top", (event.clientY) + "px");
    })
    .on('mouseout', (event, d) => {
      tooltip
        .style("display", "none")
    })

  square
    .transition()
    .duration(options.transition)
    .delay((d, i) => Math.random() * options.delay)
    .attr("opacity", 1);

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

  // add month labels
  const month_labels = svg.selectAll(".month-label")
    .data(data.filter(d => d.dom == 1))
    .join("text")
    .attr('x', -8)
    .attr('y', d => yScale(d.weekNumber) + yScale.bandwidth() / 2)
    .text(d => months[d.month - 1])
    .attr('text-anchor', 'end')
    .attr("font-size", "10")
    .attr('alignment-baseline', 'middle')
    .classed('month-label', true);

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
      const { iso, dow, mo, dom, weekNumber, month } = getUTCDayDetails(date);

      return {
        ...d,
        iso,
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
      .attr("x", d => (width / 3) + 30)
      .attr("y", (d, i) => i == 0 ? yScale(d.weekNumber) - options.imageSize : yScale(d.weekNumber))
      .attr("width", options.imageSize)
      .attr("height", options.imageSize)
      .style("outline", options.imageSize * 0.05 + "px solid white")
      .attr("transform", d => `rotate(${rotateScale(Math.random() * 100)})`)
      .attr("transform-origin", d => `${(width / 2) + 10 + options.imageSize / 2} ${yScale(d.weekNumber) + options.imageSize / 2}`)
      .attr("filter", `url(${options.selector}-drop-shadow)`)
      .attr("class", "artwork")
      .on("mouseover", function (event, d) {
        square
          .filter(x => JSON.stringify(x[map.date]) == JSON.stringify(d[map.date]))
          .attr("stroke-width", 3)
          .each(function (d, i) {
            d3.select(this).raise();
          });

        square
          .attr("opacity", x => JSON.stringify(x[map.date]) == JSON.stringify(d[map.date]) ? 1 : 0.8);

        d3.select(this)
          .raise()
          .transition()
          .attr("width", options.imageSize * 1.1)
          .attr("height", options.imageSize * 1.1);

      })
      .on("mouseout", function (event, d) {
        square
          .attr("stroke-width", 0.8)
          .attr("opacity", 1);

        d3.select(this)
          .transition()
          .attr("width", options.imageSize)
          .attr("height", options.imageSize)
      });

    let track_details = svg
      .selectAll(".track_details")
      .data(photoData)
      .join("text")
      .attr("x", (width / 3) + 50 + options.imageSize)
      .attr("y", (d, i) => i == 0 ? yScale(d.weekNumber) - options.imageSize + (options.imageSize / 3) : yScale(d.weekNumber) + options.imageSize / 3)
      .attr("font-size", "10")
      .text(d => d["NAME"])
      .classed("track_details", true)
      .append("tspan")
      .attr("x", (width / 3) + 50 + options.imageSize)
      .attr("dy", "1.2em")
      .attr("font-size", "10")
      .text(d => d["ANNOTATION"])
      .classed("artist_name", true)
      .append("tspan")
      .attr("x", (width / 3) + 50 + options.imageSize)
      .attr("dy", "1.2em")
      .attr("font-size", "10")
      .text(d => {
        return dateFormat(d[map.date])
      })
      .classed("release_date", true);




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


  return {
    update: update,
  }

};
