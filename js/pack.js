// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let circlepack = ((data, map, options) => {

  console.log(data)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    selector: '#vis',
    fill: null,
    stroke: null,
    group: null,
    label: 'name',
    value: 'value',
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
  ////////////// Wrangle /////////////////
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

  let root = d3.hierarchy(hierarchicalData)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  let pack = d3.pack()
    .size([width, height])
    .padding(options.padding);

  root = pack(root);

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////


  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////


  let node = svg.selectAll('.node')
    .data(root.descendants())
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  node.append('circle')
    .attr('r', d => d.r)
    .attr("fill", d => map.fill != null ? d[map.fill] : options.fill)
    .attr("stroke", d => map.stroke != null ? d[map.stroke] : options.stroke);

  node.append('text')
    .attr('dy', '.2em')
    .style('text-anchor', 'middle')
    .text(d => d.data.name ? d.data.name : '')
    .attr('font-size', d => d.r / 5);

  node.append('title')
    .text(d => d.data.name + '\n' + d.value);


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
