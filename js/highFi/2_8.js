import { chartDimensions, trimNames } from "../utility.js";

export  function BumpChart(
  data,
  selector,
  map,
  options,
  triggerSection,
  onEnterCallback
) {
  // let sankey = ((data, map, options) => {
  d3.select("#" + selector).append("id", "background-chart-2-8");
  /***********************
   *1. Access data
   ************************/

  let mapping = {
    fill: null,
    stroke: null,
    x: "x",
    y: "y",
    group: "group",
  };

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: "#vis",
    width: 1200,
    height: 600,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    fill: "#69b3a2",
    stroke: "#000",
    padding: 0.1,
    opacity: 0.3,
  };

  // merge default options with user options
  options = { ...defaults, ...options };

  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth: width, boundedHeight: height } = chartDimensions(
    options.selector
  );

  const svg = d3
    .select("#" + options.selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .classed("vis-svg", true)
    .append("g");

  ////////////////////////////////////////
  ////////////// Transform ///////////////
  ////////////////////////////////////////
  const groupedData = d3.groups(data, (d) => d.NAME);

  // Function to fill in the missing months for each artist
  function fillMissingMonths(data) {
    return data.map(([artistName, entries]) => {
      // Create a map with all months set to a default object
      const monthEntries = new Map(
        Array.from({ length: 12 }, (_, i) => [
          i + 1,
          {
            SCORE_MONTH: i + 1,
            CM_ARTIST: 0,
            NAME: artistName,
            SCORE_25_75: 0,
            MONTHLY_ARTIST_RANK: 10,
          },
        ])
      );

      // Fill in the existing data
      entries.forEach((entry) => {
        monthEntries.set(entry.SCORE_MONTH, entry);
      });

      // Convert the map back to an array
      const completeEntries = Array.from(monthEntries.values());

      return { name: artistName, values: completeEntries };
    });
  }

  // Apply the function to fill in missing months
  const nestedData = fillMissingMonths(groupedData).filter((d) => d.name);
  d3.select("#foreground-2-8")
    .selectAll("section")
    .data(nestedData)
    .join("section")
    .attr("class", (d, i) => {
      return `${triggerSection} ${d["name"]}`;
    });

  let firstAppearance = data.reduce((accumulator, current) => {
    if (!accumulator.some((d) => d[map.group] === current[map.group])) {
      accumulator.push(current);
    }
    return accumulator;
  }, []);

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[map.x]))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[map.y])])
    .range([0, height]);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////
  

  // Area generator
  const area = d3
    .area()
    .x((d) => xScale(d[map.x]))
    .y0((d) => (d[map.y] === 10 ? height : yScale(d[map.y] - 1)))
    .y1((d) => yScale(d[map.y]))
    .curve(d3.curveBumpX);

  // Drawing areas
  let paths = svg
    .selectAll(".area")
    .data(nestedData)
    .join("path")
    .attr("class", "area-2-8")
    .attr("id", (d) => trimNames(d.name))
    .attr("d", (d) => area(d.values))
    .attr("fill", (d) => (map.fill != null ? d[map.fill] : options.fill))
    .attr("opacity", options.opacity)
    .on('click', function(event,d) {

    })

  svg
    .selectAll(".labels")
    .data(firstAppearance)
    .join("text")
    .attr("class", "labels")
    .attr("x", (d) => xScale(d[map.x]))
    .attr("y", (d) => yScale(d[map.y] - 0.5))
    .text((d) => d[map.group]);

  ////////////////////////////////////////
  //////////////// Axis //////////////////
  ////////////////////////////////////////

  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, focus) {

    paths
        .transition()
        .duration(options.transition)
        .attr("opacity", d => d.name == focus ? 1 : options.opacity);
    
  }

  return {
    update: update,
  };
}
