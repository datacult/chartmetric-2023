// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { gauge } from './gauge.js';

export function viz_1_2(data, map, options) {

  // temp data fix
  data.forEach(d => {
    if (d.platform == "Tiktok") d.platform = "TikTok"
    if (d.platform == "Youtube") d.platform = "YouTube"
  })

  let gender_data = data.filter(d => d.type == "gender")

  let bar_data = data.filter(d => d.type == "age")


  console.log(data, bar_data, gender_data)

  let mapping = {
    x: 'sub_type',
    y: "percentage",
  }

  map = { ...mapping, ...map };

  let defaults = {
    selector: '#viz_1_2',
  }

  options = { ...defaults, ...options };


  let platforms = {
    "TikTok": { color: "#99D8DB", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9668_tiktok-logo.svg" loading="lazy" width="30" alt="">' },
    "Instagram": { color: "#72A8DF", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c966a_instagram-logo.svg" loading="lazy" width="30" alt="">' },
    "YouTube": { color: "#E2B5FD", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9669_yt-logo.svg" loading="lazy" width="30" alt="">' }
  }

  gender_data.forEach(d => {
    d.color = d.sub_type == "MALE_USERS" ? "#fff" : platforms[d.platform].color
  })


  let visuals = []
  let gauges = []

  Object.keys(platforms).forEach((d, i) => {

    d3.select(options.selector).append("div").attr("id", options.selector.substring(1) + "_" + d)

    options.fill = platforms[d].color
    let vis = barchart_1_2(bar_data.filter(e => e.platform == d), map, { selector: options.selector + "_" + d, fill: platforms[d].color })
    let g = gauge(gender_data.filter(e => e.platform == d), { value: "percentage", label: "sub_type", fill: "color" }, { selector: options.selector + "_" + d, fill: platforms[d].color })
    visuals.push(vis)
    gauges.push(g)

  });

  function update(){

  }

  return {
    update: update
  }
}

function barchart_1_2(data, map, options) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    x: "x",
    y: "y",
    label: 'label',
    fill: null,
    stroke: null,
    sort: null,
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 600,
    height: 400,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    padding: 0.02,
    fill: "#69b3a2",
    stroke: "#000",
    label_offset: 30,
    focus: null,
    sort: [],
    direction: 1,
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  if (map.sort != null) {
    if (options.direction > 0) {
      data = data.sort((a, b) => a[map.sort] < b[map.sort] ? 1 : -1);
    } else {
      data = data.sort((a, b) => a[map.sort] > b[map.sort] ? 1 : -1);
    }

    if (options.sort.length > 0) {
      data = data.sort((a, b) => options.sort.indexOf(a[map.sort]) - options.sort.indexOf(b[map.sort]));
    }

  }

  ////////////////////////////////////////
  //////////// Data Wrangling ////////////
  ////////////////////////////////////////


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

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(data.map(d => d[map.x]))
    .range([0, width])
    .paddingInner(options.padding);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[map.y])])
    .range([height, 0])

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const bars = svg.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("x", d => xScale(d[map.x]))
    .attr("y", d => yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(0))
    .style("fill", options.fill)
    .attr("stroke", d => "none")
    .classed("bar", true);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    console.log(newOptions)
    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

    bars
      .transition(t)
      .delay((d, i) => i * options.delay)
      .attr("y", d => map.y ? yScale(d[map.y]) : yScale(0))
      .attr("height", d => map.y ? height - yScale(d[map.y]) : height - yScale(0));
  }

  update()

  return {
    update: update,
    svg: svg,
  }

};