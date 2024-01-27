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
    fill: null,
    stroke: null,
    group: null,
    label: 'name',
    value: 'value',
    image: 'image'
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 800,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    padding: 0.1,
    size: 10,
    fill: "#69b3a2",
    stroke: "#000",
    opacity: 0.5,
    focus: -1
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;
  const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

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

  const defs = svg.append("defs");

  defs
    .selectAll("pattern")
    .data(data)
    .join("pattern")
    .attr("id", (d, i) => {
      return "image-fill-" + d[map.label];
    }) // Unique ID for each pattern
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr("xlink:href", (d) => d[map.image]) // URL of the image
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMidYMid slice");

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

  console.log(hierarchicalData)

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

  let background = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "transparent")

  let node = svg.selectAll('.node')
    .data(root.descendants())
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  node.append('circle')
    .attr('r', d => d.depth > 1 ? options.focus == -1 ? 0 : d.r : d.r)
    .attr("fill", d => map.fill != null ? d[map.fill] : options.fill)
    .attr("stroke", d => map.stroke != null ? d[map.stroke] : options.stroke)
    .attr("fill-opacity", d => d.depth > options.focus + 1 ? options.opacity : 0)
    .attr("mix-blend-mode", "screen")
    .attr("pointer-events", "all");

  node.append('text')
    .attr('dy', '.2em')
    .style('text-anchor', 'middle')
    .text(d => d.data.name ? d.data.name : '')
    .attr('font-size', d => d.r / 5)
    .attr('opacity', d => d.depth == 0 ? 0 : d.depth == options.focus + 2 ? 1 : 0)
    .attr("pointer-events", "none");

  node.append('title')
    .text(d => d.data.name + '\n' + d.value);

  node
    .on('mouseover', function (event, d) {

      if (d.depth < 1) {
        updateFocus(d.depth)
      }

      if (d.depth == 2) {
        d3.select(this).select('circle')
          .attr("fill", d => "url(#image-fill-" + d.data.name + ")")
          .attr("fill-opacity", 1)

        d3.select(this).select('text')
          .attr("opacity", 0)
      }

    })
  .on('mouseout', function (event, d) {

    if (d.depth == 2) {
      d3.select(this).select('circle')
        .attr("fill", d => map.fill != null ? d[map.fill] : options.fill)
        .attr("fill-opacity", options.opacity)

      d3.select(this).select('text')
        .attr("opacity", 1)
    }

  })


  background
    .on("mouseover", function (event, d) {
      updateFocus(-1)

    })


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function updateFocus(focus) {

    options.focus = focus;

    node.selectAll('circle')
      .transition()
      .duration(options.transition)
      .attr("fill-opacity", d => d.depth > options.focus + 1 ? options.opacity : 0)
      .attr('r', d => d.depth > 1 ? options.focus == -1 ? 0 : d.r : d.r);

    node.selectAll('text')
      .transition()
      .duration(options.transition)
      .attr('opacity', d => d.depth == 0 ? 0 : d.depth == options.focus + 2 ? 1 : 0)

  }

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition)

  }

  return {
    update: update,
  }

});
