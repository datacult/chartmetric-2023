// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let calendarHeatmap = ((data, map, options) => {

  console.log(data)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    selector: '#vis',
    fill: null,
    stroke: null,
    value: 'value',
    date: 'date',
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    width: 1200,
    height: 250,
    margin: { top: 50, right: 50, bottom: 50, left: 100 },
    transition: 400,
    delay: 100,
    padding: 0,
    fill: "#69b3a2",
    stroke: "#000",
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const div = d3.select(map.selector);

  const container = div.append('div')
    .classed('vis-svg-container', true);

  const svg = container.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .classed('vis-svg', true)
    .append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
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
  data = data.filter(d => new Date(d[map.date]).getFullYear() == 2022);

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

  console.log(data);

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.weekNumber).sort((a, b) => a > b ? 1 : -1))
    .range([0, width])
    .padding(options.padding)

  const yScale = d3.scaleBand()
    .domain(daysOfWeek.reverse())
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
    .attr('x', d => xScale(d.weekNumber))
    .attr('y', d => yScale(d.dow))
    .attr('width', d => xScale.bandwidth())
    .attr('height', d => yScale.bandwidth())
    .attr("fill", d => map.value != null ? colorScale(d[map.value]) : options.fill)
    .attr("stroke", d => map.stroke != null ? colorScale(d[map.stroke]) : options.stroke)
    .classed('square', true)
    .on('mouseover', (event, d) => {

      console.log(event)
      tooltip
        .style("opacity", 1)
        .html(`<p>${d[map.date]}</p><p>${d[map.value]}</p>`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) + "px");
    })
    .on('mouseout', (event, d) => {
      tooltip
        .style("opacity", 0)
    });

  console.log(data.filter(d => d.mo == 1));

  const left_month_line = svg.selectAll(".month-line")
    .data(data.filter(d => d.mo == 1))
    .join("line")
    .attr('x1', d => xScale(d.weekNumber))
    .attr('x2', d => xScale(d.weekNumber))
    .attr('y1', d => yScale(d.dow))
    .attr('y2', d => yScale(d.dow) + yScale.bandwidth())
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .classed('month-line', true);

  const top_month_line = svg.selectAll(".end-month-line")
    .data(data.filter(d => d.dom == 1 && d.dow != "sunday"))
    .join("line")
    .attr('x1', d => xScale(d.weekNumber))
    .attr('x2', d => xScale.bandwidth() + xScale(d.weekNumber))
    .attr('y1', d => yScale(d.dow) + yScale.bandwidth())
    .attr('y2', d => yScale(d.dow) + yScale.bandwidth())
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .classed('end-month-line', true);

  const days = svg.selectAll(".days")
    .data(daysOfWeek)
    .join("text")
    .attr('x', d => -20)
    .attr('y', d => yScale(d) + (yScale.bandwidth() / 2))
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'middle')
    .text(d => d)
    .classed('days', true);


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

});
