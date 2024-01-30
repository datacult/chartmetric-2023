// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

export function barchart(data, map, options, svg) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    x: "x",
    y: "y",
    label: 'label',
    fill: null,
    stroke: null,
    sort: null,
    direction: 1,
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
    fill: "#69b3a2",
    stroke: "#000",
    label_offset: 30
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  if (map.sort != null) {
    if (map.direction > 0) {
      data = data.sort((a, b) => a[map.sort] < b[map.sort] ? 1 : -1);
    } else {
      data = data.sort((a, b) => a[map.sort] > b[map.sort] ? 1 : -1);
    }

    if (options.sort != null) {
      targets = targets.sort((a, b) => options.sort.indexOf(a[map.sort]) - options.sort.indexOf(b[map.sort]));
    }

  }

  ////////////////////////////////////////
  //////////// Data Wrangling ////////////
  ////////////////////////////////////////

  let lineData = []

  lineData.push({ x: data[0][map.x], y: 0 })

  data.forEach(function (d) {
    lineData.push({ x: d[map.x], y: 0 })
  })

  lineData.push({ x: "", y: 0 })

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  if (svg == null) {

    const div = d3.select(options.selector);

    const container = div.append('div')
      .classed('vis-svg-container', true);

    svg = container.append('svg')
      .attr('width', '100%') // Responsive width
      .attr('height', '100%') // Responsive height
      .attr('viewBox', `0 0 ${options.width} ${options.height}`)
      .classed('vis-svg', true)
      .append('g')
      .attr('transform', `translate(${options.margin.left},${options.margin.top})`);
  }

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Gradients ///////////////
  ////////////////////////////////////////

  let defs = svg.append("defs");

  data.forEach(function (d) {
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
  data.forEach((d, i) => {
    lineGradient.append("stop")
      .attr("offset", `${i / (data.length - 1) * 100}%`)
      .attr("stop-color", d[map.stroke]);
  });

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(data.map(d => d[map.x]))
    .range([0, width])
    .paddingInner(options.padding);

  const yScale = d3.scaleSymlog()
    .domain([0, d3.max(data, d => d[map.y])])
    .range([height, 0])

  const lineGenerator = d3.line()
    .x(d => d.x != "" ? xScale(d.x) : width)
    .y(d => yScale(d.y))
    .curve(d3.curveStepAfter)

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const text = svg.selectAll(".text")
    .data(data)
    .join("text")
    .attr("x", d => xScale(d[map.x]) + xScale.bandwidth() / 2)
    .attr("y", d => height + 20)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text(d => d[map.x])
    .classed("text", true);


  const bars = svg.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("x", d => xScale(d[map.x]))
    .attr("y", d => yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(0))
    .style("fill", d => "url(#gradient-" + d.stage + ")")
    .attr("stroke", d => "none")
    .classed("bar", true);

  const line = svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "url(#lineGradient)")
    .attr("stroke-width", 3)
    .attr("d", lineGenerator(lineData))
    .attr("stroke-linecap", "round")

  const labels = svg.selectAll(".label")
    .data(data)
    .join("text")
    .attr("x", d => xScale(d[map.x]) + xScale.bandwidth() / 2)
    .attr("y", (d, i) => yScale(0) + options.label_offset)
    .attr("text-anchor", "middle")
    .text(d => d[map.label])
    .classed("label", true)
    .call(wrap, xScale.bandwidth() * 0.9);


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

    lineData = []

    lineData.push({ x: data[0][map.x], y: 0 })

    data.forEach(function (d) {
      lineData.push({ x: map.x ? d[map.x] : 0, y: map.y ? d[map.y] : 0 })
    });

    lineData.push({ x: "", y: 0 })

    //required to get the total path length before the transition has been completed
    const ghostPath = svg.append('path')
      .attr("d", lineGenerator(lineData))
      .attr("stroke", "none")
      .attr("fill", "none")
      .attr("opacity", 0)

    line.transition(t)
      .attr("d", lineGenerator(lineData))

    bars
      .transition(t)
      .attr("y", d => map.y ? yScale(d[map.y]) : yScale(0))
      .attr("height", d => map.y ? height - yScale(d[map.y]) : height - yScale(0));
  }

  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0, //<-- 0!
        lineHeight = 2, // px
        x = text.attr("x"), //<-- include the x!
        dy = text.attr("dy") ? text.attr("dy") : 20, //<-- null check
        tspan = text.text(null).append("tspan").attr("x", x).attr("dy", dy);
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("dy", ++lineNumber * lineHeight + dy).text(word);
        }
      }
    });
  }


  return {
    update: update,
    svg: svg,
  }

};