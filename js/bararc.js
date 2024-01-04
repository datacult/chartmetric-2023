// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let bararcchart = ((bardata, links, map, options) => {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    selector: '#vis',
    x: "x",
    y: "y",
    fill: null,
    stroke: null,
    sort: null,
    direction: 1,
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
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  if (map.sort != null) {
    if (map.direction > 0) {
      bardata = bardata.sort((a, b) => a[map.sort] < b[map.sort] ? 1 : -1);
    } else {
      bardata = bardata.sort((a, b) => a[map.sort] > b[map.sort] ? 1 : -1);
    }
  }

  ////////////////////////////////////////
  //////////// Data Wrangling ////////////
  ////////////////////////////////////////

  links = links.filter(d => d.source != d.target)
  console.log(bardata, links)

  const lineData = []

  lineData.push({ x: bardata[0][map.x], y: 0 })

  bardata.forEach(function (d) {
    lineData.push({ x: d[map.x], y: d[map.y] })
  })

  lineData.push({ x: "", y: 0 })

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
  ////////////// Gradients ///////////////
  ////////////////////////////////////////

  let defs = svg.append("defs");

  bardata.forEach(function (d) {
    let gradient = defs.append("linearGradient")
      .attr("id", "gradient-" + d.stage)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d[map.fill])
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 0);
  });

  // Create a linear gradient for the line color
  let lineGradient = defs
    .append("linearGradient")
    .attr("id", "lineGradient");

  // Add color stops to the gradient
  bardata.forEach((d, i) => {
    lineGradient.append("stop")
      .attr("offset", `${i / (bardata.length - 1) * 100}%`)
      .attr("stop-color", d[map.stroke]);
  });

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(bardata.map(d => d[map.x]))
    .range([0, width])
    .paddingInner(options.padding);

  const yScale = d3.scaleSqrt()
    .domain([0, d3.max(bardata, d => d[map.y])])
    .range([height, 0])

  const strokeScale = d3.scaleLinear()
    .domain(d3.extent(links, d => d[map.value]))
    .range([2, 20]);

  const lineGenerator = d3.line()
    .x(d => d.x != "" ? xScale(d.x) : width)
    .y(d => yScale(d.y))
    .curve(d3.curveStepAfter)

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const arc = svg.selectAll(".link")
    .data(links)
    .join("path")
    .attr("class", "link")
    .attr("d", d => {
      const axis_line = height + 40
      const start = xScale(d.source) + xScale.bandwidth() / 2;
      const end = xScale(d.target) + xScale.bandwidth() / 2;
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
    .attr("opacity", 0.2)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", function (d) {
      return this.getTotalLength() + " " + this.getTotalLength()
    })
    .attr("stroke-dashoffset", function (d) {
      return this.getTotalLength()
    });

  const text = svg.selectAll(".text")
    .data(bardata)
    .join("text")
    .attr("x", d => xScale(d[map.x]) + xScale.bandwidth() / 2)
    .attr("y", d => height + 20)
    .attr("text-anchor", "middle")
    .text(d => d[map.x])
    .classed("text", true);

  const bars = svg.selectAll(".bar")
    .data(bardata)
    .join("rect")
    .attr("x", d => xScale(d[map.x]))
    .attr("y", d => yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(0))
    .style("fill", d => "url(#gradient-" + d.stage + ")")
    .attr("stroke", d => "none")
    .classed("bar", true)
    .on("mouseover", function (event, d) {
      arc
        .attr("stroke-dashoffset", function (x) {
          return x.source == d[map.x] ? this.getTotalLength() : 0
        })
        .attr("opacity", x => x.source == d[map.x] ? 1 : 0.05)
        .attr("stroke", x => x.source == d[map.x] ? map.stroke != null ? d[map.stroke] : options.stroke : options.stroke)
        .transition()
        .duration(options.transition)
        .attr("stroke-dashoffset", 0)
    })
    .on("mouseout", function (event, d) {
      arc
        .transition()
        .duration(options.transition / 2)
        .attr("opacity", 0.2)
        .attr("stroke", options.stroke)
    });

  const line = svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "url(#lineGradient)")
    .attr("stroke-width", 3)
    .attr("d", lineGenerator(lineData))
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", function (d) {
      return this.getTotalLength() + " " + this.getTotalLength()
    })
    .attr("stroke-dashoffset", function (d) {
      return this.getTotalLength()
    })


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = bardata, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

    // resort data if needed
    if (map.sort != null) {
      if (map.direction == "asc") {
        bardata = bardata.sort((a, b) => a[map.sort] < b[map.sort] ? 1 : -1);
      } else {
        bardata = bardata.sort((a, b) => a[map.sort] > b[map.sort] ? 1 : -1);
      }
    }

    bars
      .transition()
      .delay((d, i) => i * (options.transition / bardata.length))
      .duration(options.transition / 2)
      .attr("y", d => yScale(d[map.y]))
      .attr("height", d => height - yScale(d[map.y]))

    line.transition(t)
      .attr("stroke-dashoffset", 0)

    arc.transition(t)
      .delay((d, i) => xScale.domain().indexOf(d.source) * (options.transition / bardata.length))
      .duration(options.transition / 2)
      .attr("stroke-dashoffset", 0)

  }

  // call for initial bar render
  update(bardata)

  return {
    update: update,
    svg: svg,
  }

});
