// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let bubblechart = ((data, map, options) => {

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
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    width: 800,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    padding: 0.1,
    size: 10,
    fill: "#69b3a2",
    stroke: "#000",
  }

  // merge default options with user options
  options = { ...defaults, ...options };


  if (map.size == null && map.group != null) {
    data = d3.groups(data, d => d[map.group])
  }


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

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const sizeScale = d3.scaleLinear()
    .domain(d3.extent(data, d => map.size != null ? d[map.size] : map.group != null ? d[1].length : options.size))
    .range([options.width / 100, options.width / 10])

  ////////////////////////////////////////
  ////////////// Simulation //////////////
  ////////////////////////////////////////

  const simulation = d3.forceSimulation(data)
    .force("charge", d3.forceManyBody().strength(5))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(d => map.size != null ? sizeScale(d[map.size]) : map.group != null ? sizeScale(d[1].length) : sizeScale(options.size)))
    .on("tick", ticked);

  const drag = simulation => {

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
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
    bubbleGroup
      .attr("transform", d => `translate(${d.x},${d.y})`)
  }

  simulation.nodes(data);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  // Create the bubbles
  const bubbleGroup = svg.selectAll("circle")
    .data(data)
    .join("g")

  const bubbles = bubbleGroup
    .append("circle")
    .attr("r", d => map.size != null ? sizeScale(d[map.size]) : map.group != null ? sizeScale(d[1].length) : sizeScale(options.size))
    .attr("fill", d => d[map.fill] || options.fill)
    .attr("stroke", d => d[map.stroke] || options.stroke)
    .call(drag(simulation));

  if (map.label != null) {
    const labels = bubbleGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", 5)
      .text(d => map.group != null ? d[0] : d[map.label])
  }


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition)

    // update scales
    sizeScale
      .domain(d3.extent(data, d => map.size != null ? d[map.size] : map.group != null ? d[1].length : options.size))

    bubbleGroup.data(newData)

    bubbles
      .transition(t)
      .delay((d, i) => i * options.delay)
      .attr("r", d => map.size != null ? sizeScale(d[map.size]) : map.group != null ? sizeScale(d[1].length) : sizeScale(options.size))
      .attr("fill", d => d[map.fill] || options.fill)
      .attr("stroke", d => d[map.stroke] || options.stroke)

    simulation.restart()

  }

  // call for initial bar render
  update(data)

  return {
    update: update,
  }

});
