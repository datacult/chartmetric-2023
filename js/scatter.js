// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { trimNames } from "./utility.js";

export function scatter(data, map, options, svg) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    x: "x",
    y: "y",
    size: null,
    label: null,
    fill: null,
    stroke: null,
    focus: null,
    sort: null,
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 800,
    height: 800,
    margin: { top: 150, right: 150, bottom: 150, left: 150 },
    transition: 400,
    delay: 100,
    padding: 0.1,
    fill: "#69b3a2",
    stroke: "#000",
    label_offset: 30,
    text: "white",
    focus: [],
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

  if (svg == null) {

    const div = d3.select(options.selector);

    const container = div.append('div')
      .classed('vis-svg-container', true);

    svg = container.append('svg')
      .attr('width', '100%') // Responsive width
      .attr('height', '100%') // Responsive height
      .attr('viewBox', `0 0 ${options.width} ${options.height}`)
      .classed('vis-svg', true)
      .append('g')
      .attr('transform', `translate(${options.margin.left},${options.margin.top})`);
  }

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Gradients ///////////////
  ////////////////////////////////////////

  let defs = svg.append("defs");

  //Filter for the outside glow
  var filter = defs.append("filter")
    .attr("id", "blur")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("height", "300%")
    .attr("width", "300%")
  filter.append("feGaussianBlur")
    .attr("stdDeviation", "10")
    .attr("result", "coloredBlur");

  // add color gradients
  let fillValues = data.map(d => d[map.fill])

  const colorScale = d3
    .scaleSequential()
    .domain([1, fillValues.length + 1])
    .interpolator(d3.interpolateRainbow);

  fillValues.forEach((d, i) => {

    let gradient = defs.append("linearGradient")
      .attr("id", trimNames(d))
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", colorScale(i + 2))
      .style("stop-opacity", 1);

    gradient.append("stop")
      .attr("offset", "100%")
      .style("stop-color", colorScale(i + 1))
      .style("stop-opacity", 1);
  })

  let grescale = defs.append("filter")
    .attr("id", "grayscale");

  grescale.append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", `0.3333 0.3333 0.3333 0 0
                   0.3333 0.3333 0.3333 0 0
                   0.3333 0.3333 0.3333 0 0
                   0      0      0      1 0`);


  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[map.x]))
    .range([0, width])

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[map.y])])
    .range([height, 0])

  const rScale = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d[map.size])])
    .range([5, 80]);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const circle_group = svg.selectAll(".circle-group")
    .data(data)
    .join("g")
    .classed("circle-group", true)
    .on("mouseover", function () {
      var el = d3.select(this);
      el.raise();
    });

  const circles = circle_group.append("circle")
    .attr("cx", d => xScale(d[map.x]))
    .attr("cy", d => yScale(d[map.y]))
    .attr("r", d => rScale(d[map.size]))
    .attr("fill", d => `url(#${trimNames(d[map.fill])})`)
    .classed("circle", true)
    .style("filter", "url(#grayscale) url(#blur)");


  const rings = circle_group.append("circle")
    .attr("cx", d => xScale(d[map.x]))
    .attr("cy", d => yScale(d[map.y]))
    .attr("r", d => rScale(d[map.size] * 0.8))
    .attr("fill", d => "none")
    .attr("stroke", d => map.stroke != null ? d[map.stroke] : options.stroke)
    .classed("ring", true);


  const labels = circle_group.append("text")
    .attr("x", d => xScale(d[map.x]))
    .attr("y", d => yScale(d[map.y]))
    .attr("text-anchor", "middle")
    .attr("font-size", "1.2em")
    .attr("dominant-baseline", "middle")
    .attr("fill", options.text)
    .text(d => map.label != null ? d[map.label].replace(/\//g, " ") : "")
    .attr("pointer-events", "none")
    .style("text-transform", "uppercase")
    .classed("text", true)
    .call(wrap, 20);

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    if (newData != null) data = newData

    const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

    circle_group
      .each(function (d) {
        if (options.focus.indexOf(d[map.focus]) > -1) {
          var el = d3.select(this);
          el.raise();
        }
      })

    circles
      .data(data)
      .transition(t)
      .attr("cx", d => xScale(d[map.x]))
      .attr("cy", d => yScale(d[map.y]))
      .attr("r", d => rScale(d[map.size]))
      .style("filter", d => options.focus.length > 0 ? options.focus.indexOf(d[map.focus]) > -1 ? "url(#blur)" : "url(#grayscale) url(#blur)" : "url(#blur)")

  }

  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // Adjust line height if needed
        x = text.attr("x"),
        y = parseFloat(text.attr("y")),
        dy = parseFloat(text.attr("dy") || 0);

      // Create an initial tspan for measurement
      var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          // Increment lineNumber and add a new tspan
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", (++lineNumber * lineHeight + dy) + "em").text(word);
        }
      }

      var totalLines = text.selectAll("tspan").size();
      var textBlockHeight = totalLines * lineHeight;
      var initialOffset = (textBlockHeight / 2) - lineHeight / 2;

      // Adjust each tspan's dy to center the text block
      text.selectAll("tspan").attr("dy", function (d, i) {
        return ((i - totalLines / 2) * lineHeight + dy) + "em";
      });

      // Adjust the y position of the text to center around the original y-coordinate
      text.attr("y", y - initialOffset + "em");
    });
  }



  update()

  return {
    update: update,
    svg: svg,
  }

};