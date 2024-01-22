// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let arcchart = ((data = [], map, options, svg) => {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////


  let mapping = {
    source: "source",
    target: "target",
    value: "value",
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
    fill: "#69b3a2",
    stroke: "#000",
    focus: null,
    opacity: 0.03
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Wrangling ////////////
  ////////////////////////////////////////

  data = data.filter(d => d[map.source] != d[map.target])
  let targets = Array.from(new Set(data.map(d => d[map.target])))

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  if (options.direction > 0) {
    targets = targets.sort((a, b) => a < b ? 1 : -1);
  } else {
    targets = targets.sort((a, b) => a > b ? 1 : -1);
  }

  if (options.sort != null) {
    targets = targets.sort((a, b) => options.sort.indexOf(a) - options.sort.indexOf(b));
  }

  console.log(data, targets)

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  if (svg == null) {
    const div = d3.select(map.selector);

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
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(targets)
    .range([0, width])
    .paddingInner(options.padding);

  const strokeScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[map.value]))
    .range([2, 20]);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const arc = svg.selectAll(".link")
    .data(data)
    .join("path")
    .attr("class", "link")
    .attr("d", d => {
      const axis_line = height + 40
      const start = xScale(d[map.source]) + xScale.bandwidth() / 2;
      const end = xScale(d[map.target]) + xScale.bandwidth() / 2;
      return ['M', start, axis_line,
        'A',
        (start - end) / 2, ',',
        -(start - end) / 2, 0, 0, ',',
        start < end ? 0 : 1, end, ',', axis_line]
        .join(' ');
    })
    .attr("fill", "none")
    .attr("stroke", options.stroke)
    .attr("stroke-width", d => strokeScale(d[map.value]))
    .attr("opacity", options.opacity)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", function (d) {
      return this.getTotalLength() + " " + this.getTotalLength()
    })
    .attr("stroke-dashoffset", function (d) {
      return this.getTotalLength()
    });

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

    if (options.focus != null) {

      arc
        .attr("stroke-dashoffset", function (d) {
          return d[map.source] == options.focus ? this.getTotalLength() : d3.select(this).attr("stroke-dashoffset") == this.getTotalLength() ? this.getTotalLength() : 0
        })
        .attr("opacity", d => d[map.source] == options.focus ? 1 : options.opacity)
        .attr("stroke", d => d[map.source] == options.focus ? map.stroke != null ? d[map.stroke] : options.stroke : options.stroke)
        .transition(t)
        .duration(options.transition)
        .attr("stroke-dashoffset", 0);

    } else {

      arc
        .transition(t)
        .delay((d, i) => xScale.domain().indexOf(d[map.source]) * (options.transition / targets.length))
        .duration(options.transition / 2)
        .attr("stroke-dashoffset", 0)
        .attr("opacity", options.opacity)
        .attr("stroke", options.stroke);

    }
  }

  return {
    update: update,
    svg: svg,
  }

});
