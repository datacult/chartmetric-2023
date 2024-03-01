// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

// Description: choropleth map of the world with a tooltip & legend

import { legend } from './components/legend.js';
export function viz_2_13(data, map, options) {

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
    width: 850,
    height: 480,
    margin: { top: 120, right: 20, bottom: 20, left: 20 },
    transition: 1000,
    delay: 50,
    stroke: "#FFF",
    fill: "none",
    focus: "",
    domain: null,
    format: d3.format(","),
    title: "",
    legend: true,
    colorScale: ["#99e6fb", "#374363"],
    unknown: "#fff"
  }

  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  ////////////////////////////////////////
  //////////// Data Wrangling ////////////
  ////////////////////////////////////////

  data.forEach(d => {
    d[map.id] == "United States" ? d[map.id] = "USA" : d[map.id] = d[map.id];
    d[map.id] == "Russian Federation" ? d[map.id] = "Russia" : d[map.id] = d[map.id];
    d[map.id] == "United Kingdom" ? d[map.id] = "England" : d[map.id] = d[map.id];
    d[map.id] == "Türkiye" ? d[map.id] = "Turkey" : d[map.id] = d[map.id];
    d[map.id] == "Tanzania" ? d[map.id] = "United Republic of Tanzania" : d[map.id] = d[map.id];

  })

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
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

  const tooltip = d3.select(options.selector).append("div")
    .attr("id", options.selector.substring(1) + "_tooltip")
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("background-color", "white")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .classed("tooltip", true);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const colorScale = d3.scaleSqrt()
    .domain(options.domain ? options.domain : [0, d3.max(data, d => d[map.value])])
    .range(options.colorScale)
    .unknown(options.unknown);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  let dataMap = new Map(data.map(d => [d[map.id], +d[map.value]]))

  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(topo => {

    topo.features = topo.features.filter(d => d.properties.name != "Antarctica")

    let countries = topo.features.map(d => d.properties.name)

    data.forEach(d => {
      if (!countries.includes(d[map.id])) {
        console.log(`No match for ${d[map.id]}`)
      }
    })

    const projection = d3.geoRobinson()
      .translate([width / 2, height / 2]);

    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .attr("fill", "transparent")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", options.stroke).attr("stroke-width", 2)

        if (dataMap.get(d.properties.name)) {
          tooltip
            .style("display", "block")
            .style("left", event.clientX + 20 + "px")
            .style("top", event.clientY + 20 + "px")
            .text(`${d.properties.name}: ${dataMap.get(d.properties.name)}`)
        }

      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "none");
        tooltip.style("display", "none")
      });

    update()

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
      .attr("transform", `translate(${width * 0.6},${-options.margin.top})`)
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

    dataMap = new Map(data.map(d => [d[map.id], +d[map.value]]))

    let transitionOrder = data.map(d => d[map.id])

    const t = d3.transition().duration(options.transition);

    colorScale
      .domain(options.domain ? options.domain : [0, d3.max(data, d => d[map.value])])
      .range(options.colorScale)

    if (options.legend == true) {
      svg.select('.legend').remove()
      addLegend()
    } else {
      svg.select('.legend').remove()
    }

    svg.selectAll("path")
      .transition(t)
      .delay((d, i) => transitionOrder.indexOf(d.properties.name) != -1 ? transitionOrder.indexOf(d.properties.name) * options.delay : transitionOrder.length * options.delay)
      .attr("fill", d => colorScale(dataMap.get(d.properties.name) || null))

  }

  return {
    update: update,
  }

};
