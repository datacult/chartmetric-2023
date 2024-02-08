// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { legend } from './legend.js';
export function choropleth(data, map, options) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    id: "id",
    value: null,
    label: null
  }

  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 800,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    stroke: "#FFF",
    fill: "none",
    focus: "",
    domain: null,
    format: d3.format(","),
    title: "",
    legend: true,
    colorScale: ["#F0F8FF", "#0096FF"]
  }

  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  // sort data

  if (map.sort != null) {
    data = data.sort((a, b) => {
      let indexA = map.order.indexOf(a[map.sort]);
      let indexB = map.order.indexOf(b[map.sort]);

      if (indexA > indexB) {
        return 1;
      }
      if (indexA < indexB) {
        return -1;
      }
      return 0;
    });
  }

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const outerContainer = d3.select(options.selector);

  const innerContainer = outerContainer.append('div')
    .classed('svg-container', true);

  const svg = innerContainer.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '85%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const centerX = options.width / 2;
  const centerY = options.height / 2;
  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const colorScale = d3.scaleSqrt()
    .domain(options.domain ? options.domain : [0, d3.max(data, d => d[map.value])])
    .range(options.colorScale)
    .unknown("#ccc");

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  let dataMap = new Map(data.map(d => [d[map.id], +d[map.value]]))

  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(topo => {

    console.log(topo)
    const projection = d3.geoRobinson()
      .translate([width / 2, height / 2]);

    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .attr("fill", d => colorScale(dataMap.get(d.properties.name) || 0))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", options.stroke).attr("stroke-width", 2)
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "none");
      });

  })

  ////////////////////////////////////////
  ////////////// Legend //////////////////
  ////////////////////////////////////////

  function addLegend() {

    let l = legend(colorScale, {
      title: options.title,
      width: width * 0.4,
      tickSize: 0,
      tickFormat: options.format,
    })

    svg.append('g')
      .attr("transform", `translate(${width * 0.6},${80})`)
      .append(() => l)
      .classed('legend', true);

  }

  if (options.legend == true) {
    addLegend()
  }

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {


    if (newData != null) data = newData;
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    if (map.sort != null) {
      data = data.sort((a, b) => {
        let indexA = map.order.indexOf(a[map.sort]);
        let indexB = map.order.indexOf(b[map.sort]);

        if (indexA > indexB) {
          return 1;
        }
        if (indexA < indexB) {
          return -1;
        }
        return 0;
      });
    }


    const t = d3.transition().duration(options.transition);

    valuemap = new Map(data.map(d => [d[map.id], +d[map.value]]));
    labelsmap = new Map(data.map(d => [d[map.id], d[map.label]]));

    colorScale.domain(options.domain ? options.domain : d3.extent(data, d => d[map.value])).range(generateDiscreteColors(options.colorScale)).nice()

    if (options.legend == true) {
      svg.select('.legend').remove()
      addLegend()
    } else {
      svg.select('.legend').remove()
    }

  }


  return {
    update: update,
  }

};
