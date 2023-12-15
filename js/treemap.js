// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let treemap = ((data, map, options) => {

  console.log(data)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    selector: '#vis',
    fill: null,
    stroke: null,
    group: null,
    value: 'value',
    label: 'name'
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    width: 1200,
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
  ////////////// Transform /////////////////
  ////////////////////////////////////////

  function transformData(data) {
    var root = {
      "name": "root",
      "children": []
    };

    if (map.group != null) {

      var groups = {};

      data.forEach(function (d) {
        var groupName = d[map.group];

        if (!groups[groupName]) {
          groups[groupName] = {
            "name": groupName,
            "children": []
          };
          root.children.push(groups[groupName]);
        }

        groups[groupName].children.push({
          "name": d[map.label],
          "value": d[map.value]
        });
      });

    } else {

      data.forEach(function (d) {
        root.children.push({
          "name": d[map.label],
          "value": d[map.value]
        });
      });
      
    }

    return root;
  }

  var hierarchicalData = transformData(data);

  ////////////////////////////////////////
  ////////////// Treemap //////////////////
  ////////////////////////////////////////

  var root = d3.hierarchy(hierarchicalData).sum(d => d.value);

  d3.treemap()
    .size([width, height])
    .padding(options.padding)
    (root)

  console.log(root)

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  // Create the bubbles
  const leaves = svg.selectAll("rect")
    .data(root.leaves())
    .join("rect")
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr("fill", d => map.fill != null ? d[map.fill] : options.fill)
    .attr("stroke", d => map.stroke != null ? d[map.stroke] : options.stroke);

  const labels = svg.selectAll("text")
    .data(root.leaves())
    .join("text")
    .attr("x", d => d.x0 + 5)
    .attr("y", d => d.y0 + 20)
    .text(d => d.data.name);


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition)

    root = d3.hierarchy(data).sum(d => d[map.group]);

    d3.treemap()
      .size([width, height])
      .padding(options.padding)
      (root)

    leaves
      .data(root.leaves())
      .transition(t)
      .delay((d, i) => i * options.delay)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr("fill", d => map.fill != null ? d[map.fill] : options.fill)
      .attr("stroke", d => map.stroke != null ? d[map.stroke] : options.stroke)

  }

  // call for initial bar render
  update(data)

  return {
    update: update,
  }

});
