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
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    width: 1200,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    fill: "#69b3a2",
    stroke: "#000",
    align: 'justify',
    nodeWidth: 15,
    padding: 10,
    colors: d3.scaleOrdinal(d3.schemeCategory10)
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
  ////////////// Sankey //////////////////
  ////////////////////////////////////////

  const sankey = d3.sankey()
    .nodeWidth(options.nodeWidth)
    .nodePadding(options.padding)
    .size([options.width, options.height]);

  var path = sankey.links();

  // Compute the Sankey diagram
  const { nodes, links } = sankey(data);

////////////////////////////////////////
////////////// DOM Setup ///////////////
////////////////////////////////////////

svg.append('g')
  .selectAll('rect')
  .data(nodes)
  .join('rect')
  .attr('x', d => d.x0)
  .attr('y', d => d.y0)
  .attr('height', d => d.y1 - d.y0)
  .attr('width', sankey.nodeWidth())
  .attr('fill', d => options.colors(d.name));

svg.append('g')
  .selectAll('text')
  .data(nodes)
  .join('text')
  .attr('x', d => d.x0 - 6)
  .attr('y', d => (d.y1 + d.y0) / 2)
  .attr('dy', '0.35em')
  .attr('text-anchor', 'end')
  .text(d => d.name);

// Draw links
svg.append('g')
  .attr('fill', 'none')
  .selectAll('path')
  .data(links)
  .join('path')
  .attr('d', d3.sankeyLinkHorizontal())
  .attr('stroke', d => options.colors(d.source.name))
  .attr('stroke-width', d => Math.max(1, d.width));


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
