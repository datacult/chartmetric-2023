// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { trimNames } from "./utility.js";

export function imagecluster(data, map, options, svg) {

  console.log(data)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    selector: '#vis',
    size: null,
    fill: null,
    stroke: null,
    group: null,
    label: null,
    value: null,
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    width: 800,
    height: 800,
    margin: { top: 100, right: 100, bottom: 100, left: 100 },
    transition: 1000,
    delay: 100,
    padding: 0.05,
    size: 10,
    fill: "#69b3a2",
    stroke: "#000",
    text: "black",
    format: ".2r",
    force: 0.1,
    opacity: 0.8,
    blend: "luminosity",
    range: null,
    domain: null
  }

  // merge default options with user options
  options = { ...defaults, ...options };


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

  // hard code fix
  const tooltip = d3.select("#viz_1_5_tooltip")

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  function imageName(url) {

    let imageName = ""

    if (url != null) {
      imageName = url.split('/')[url.split('/').length - 1]
    }

    return imageName;
  }

  ////////////////////////////////////////
  ////////////// Gradients ///////////////
  ////////////////////////////////////////

  let defs = svg.append("defs");

  //Filter for the outside glow
  var blur = defs.append("filter")
    .attr("id", "blur")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("height", "200%")
    .attr("width", "200%")
  blur.append("feGaussianBlur")
    .attr("stdDeviation", "50")
    .attr("result", "coloredBlur");

  let floodfilter = defs.append("filter")
    .attr("id", options.selector + "floodfilter");
  floodfilter.append("feFlood")
    .attr("result", "floodFill")
    .attr("flood-color", options.fill)
  floodfilter.append("feBlend")
    .attr("in", "SourceGraphic")
    .attr("in2", "floodFill")
    .attr("mode", options.blend)
    .attr("result", "blend");
  floodfilter.append("feComposite")
    .attr("in", "blend")
    .attr("in2", "SourceGraphic")
    .attr("operator", "atop");

  if (map.fill != null) {

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
  }

  if (map.image != null) {

    defs
      .selectAll("pattern")
      .data(data)
      .join("pattern")
      .attr("id", (d, i) => {
        return "image-fill-" + imageName(d[map.image]);
      })
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("xlink:href", (d) => d[map.image])
      .attr("width", 1)
      .attr("height", 1)
      .attr("preserveAspectRatio", "xMidYMid slice");
  }


  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const sizeScale = d3.scaleLinear()
    .domain(options.domain != null ? options.domain : d3.extent(data, d => map.size != null ? d[map.size] : options.size))
    .range(options.range != null ? options.range : [options.width * 0.05, options.width * (data.length / 100)])
    .unknown(0)

  ////////////////////////////////////////
  ////////////// Simulation //////////////
  ////////////////////////////////////////

  // initial positions
  data.forEach(d => {
    d.x = width / 2;
    d.y = height / 2;
    d.r = map.size != null ? sizeScale(d[map.size]) : sizeScale(options.size)
  });

  const simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(-10))
    .force('x', d3.forceX().strength(0.1).x(width / 2))
    .force('y', d3.forceY().strength(0.1).y(height / 2))
    .force("collision", d3.forceCollide().radius(d => d.r))
    .on("tick", ticked);


  const drag = simulation => {

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(options.force).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {

      d.fx = Math.max(d.r, Math.min(width - d.r, event.x));
      d.fy = Math.max(d.r, Math.min(height - d.r, event.y));
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  function ticked() {
    bubbles
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)

    if (labels) {
      labels
        .attr("transform", d => `translate(${d.x},${d.y})`)
    }

  }

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const background = svg.append("circle")
    .attr("r", width / 2)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("fill", options.fill)
    .attr("fill-opacity", 0.8)
    .style("filter", `url(#blur)`)

  const bubbles = svg.selectAll("bubbles")
    .data(data)
    .join("circle")
    .attr("r", d => 0)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("fill", d => "url(#image-fill-" + imageName(d[map.image]) + ")")
    .attr("stroke", d => d[map.stroke] || options.stroke)
    .attr("stroke-width", 10)
    .style("filter", `url(#${options.selector}floodfilter)`)
    .classed("bubbles", true)
    .call(drag(simulation))
    .on('mouseover', function (event, d) {
      d3.select(this).style("filter", "")
      updateTooltip(event, d)
    })
    .on('mouseout', function (event, d) {
      d3.select(this).style("filter", `url(#${options.selector}floodfilter)`)
      tooltip.style("display", "none")
    });

  let labels, value_labels;

  if (map.label != null) {
    labels = svg.selectAll("text")
      .data(data)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("fill", options.text)
      .attr("font-size", d => d3.max([sizeScale(d[map.size]) / 3, 20]))
      .text(d => map.size != null ? d3.format(options.format)(d[map.value] * 100) + "%" : "")
      .attr("transform", d => `translate(${width / 2},${height / 2})`)
      .attr("opacity", 0)
      .attr("pointer-events", "none");

    value_labels = labels
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "1.2em")
      .attr("font-size", d => d3.max([sizeScale(d[map.size]) / 6, 15]))
      .text(d => map.label != null ? d[map.label] : 0);
  }

  function updateTooltip(event, d) {

    const [xCoord, yCoord] = d3.pointer(event);

    tooltip
      .style("display", "block")
      .style("left", xCoord + 5 + "px")
      .style("top", yCoord + 5 + "px").html(`
          <div class="topline">
    <div class="state">${d.ARTIST_NAME}</div>
    <div class="billHR">${d.PLATFORM}</div>
    <div class="billText">
        ⮕ <strong>Followers:</strong> ${d3.format(".3s")(d[map.size])}
    </div>
    </div>`);
  }

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    if (newData != null) data = newData;

    console.log(data, map, options)

    const t = d3.transition().duration(options.transition);

    // update scales
    sizeScale
      .domain(options.domain != null ? options.domain : d3.extent(data, d => map.size != null ? d[map.size] : options.size))
      .range(options.range != null ? options.range : [options.width * 0.05, options.width * (data.length / 100)])

    data.forEach(d => {
      d.r = map.size != null ? sizeScale(d[map.size]) : sizeScale(options.size);
    });

    bubbles
      .data(data)
      .transition(t)
      .attr("r", d => d.r)

    if (labels) {
      labels
        .data(data)
        .transition(t)
        .delay(options.transition / 2)
        .attr("opacity", 1);
    }

    simulation.force("collide", d3.forceCollide(d => d.r));
    simulation.alpha(1).restart();

  }

  // call for initial bar render
  update(data)

  return {
    update: update,
  }

};