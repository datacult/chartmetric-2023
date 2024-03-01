// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { legend } from "./components/legend.js";

export function calendarsummary(data, map, options) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    fill: null,
    date: 'date',
    label: 'label',
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 1200,
    height: 250,
    margin: { top: 50, right: 50, bottom: 50, left: 100 },
    transition: 400,
    delay: 100,
    padding: 0,
    fill: "#69b3a2",
    stroke: "#000",
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const div = d3.select(options.selector);

  const legendContainer = div.append('div')
    .classed('legend', true)

  const summaryContainer = div.append('div')
    .classed('summary', true);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const colorScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[map.fill]))
    .range(["rgb(226,178,236)", "rgb(41,13,34)"])

    let l = legend(colorScale, {
      title: 'Monthly Track Release Count',
      width: width * 0.4,
      tickSize: 0,
    })

    legendContainer.append(() => l)

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const months = summaryContainer.selectAll('.month')
    .data(data)
    .join('div')
    .classed('month', true)
    .style('width', `${width / 6}px`)
    .style('background-color', d => colorScale(d[map.fill]))
    .style('display', 'inline-block')
    .style('margin', '5px')
    .style('border-radius', '5px')
    .style('padding', '10px')
    .style('border', '0px')
    .style('box-sizing', 'border-box')
    .style('text-align', 'center')
    .style('color', 'white')
    .append('div')
    .text(d => d[map.date])
    .style("font-weight", "bold")
    .append("div")
    .text(d => d3.format(",")(d[map.label]))
    .style("font-weight", "normal")



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

};
