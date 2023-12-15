// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let sankey = ((data, map, options) => {

  console.log(data)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    selector: '#vis',
    fill: null,
    stroke: null,
    x: 'x',
    y: 'y',
    group: 'group',
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    width: 1200,
    height: 600,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    fill: "#69b3a2",
    stroke: "#000",
    padding: 0.1,
    opacity: 0.3,
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

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Transform ///////////////
  ////////////////////////////////////////

  let nestedData = d3.groups(data, d => d[map.group])
    .map(group => ({ name: group[0], values: group[1] }));


let firstAppearance = data.reduce((accumulator, current) => {
  if (!accumulator.some(d => d[map.group] === current[map.group])) {
      accumulator.push(current);
  }
  return accumulator;
}, []);

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[map.x]))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[map.y])])
    .range([0, height]);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  // Area generator
  const area = d3.area()
    .x(d => xScale(d[map.x]))
    .y0(d => yScale(d[map.y] - 1))
    .y1(d => yScale(d[map.y]))
    .curve(d3.curveMonotoneX);

  // Drawing areas
  svg.selectAll('.area')
    .data(nestedData)
    .join('path')
    .attr('class', 'area')
    .attr('d', d => area(d.values))
    .attr('fill', d => map.fill != null ? d[map.fill] : options.fill)
    .attr('opacity', options.opacity)
    .on('mouseover', (event, d) => {
      d3.select(event.target).transition()
        .duration(options.transition)
        .attr("opacity", 1);
    })
    .on('mouseout', (event, d) => {
      d3.select(event.target).transition()
        .duration(options.transition)
        .attr("opacity", options.opacity);
    });

  svg.selectAll('.labels')
    .data(firstAppearance)
    .join('text')
    .attr('class', 'labels')
    .attr('x', d => xScale(d[map.x]))
    .attr('y', d => yScale(d[map.y] - 0.5))
    .text(d => d[map.group]);

  ////////////////////////////////////////
  //////////////// Axis //////////////////
  ////////////////////////////////////////

  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

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
