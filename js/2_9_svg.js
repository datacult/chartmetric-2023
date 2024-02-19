// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

export function viz_2_9(data, map, options, svg) {

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
    filter: null,
    genre: null,
    stage: null,
    country: null,
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 1200,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 1000,
    delay: 100,
    padding: 0.2,
    fill: "#fff",
    stroke: "#000",
    label_offset: 35,
    focus: null,
    sort: [],
    direction: 0,
    filter: null,
    stage_width: 150,
    genre_width: 150,
    genre_width_padding: 10,
    tooltip_fill: "white",
    tooltip_stroke: "none",
    tooltip_item_fill: "#F0F0F0",
    stage_item_stroke: "#606060",
  }

  // merge default options with user options
  options = { ...defaults, ...options };

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
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition).delay((d, i) => i * options.delay);

    ////////////////////////////////////////
    //////////// Data Sorting //////////////
    ////////////////////////////////////////

    if (map.sort != null) {
      if (options.direction > 0) {
        data = data.sort((a, b) => a[map.sort] < b[map.sort] ? 1 : -1);
      } else {
        data = data.sort((a, b) => a[map.sort] > b[map.sort] ? 1 : -1);
      }

      if (options.sort.length > 0) {
        data = data.sort((a, b) => options.sort.indexOf(a[map.sort]) - options.sort.indexOf(b[map.sort]));
      }

    }

    ////////////////////////////////////////
    //////////// Data Wrangling ////////////
    ////////////////////////////////////////

    data.forEach(d => {
      if (!Array.isArray(d[map.genre])) d[map.genre] = JSON.parse(d[map.genre])
    });

    let filteredData = data

    if (map.filter != null && options.filter != null) {
      filteredData = data.filter(d => d[map.filter] == options.filter);
    }

    console.log(filteredData)

    ////////////////////////////////////////
    ////////////// Gradients ///////////////
    ////////////////////////////////////////

    let defs = svg.append("defs");

    let gradient = defs.append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("y2", "0%")
      .attr("x2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", options.fill)
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 0);

    if (map.image != null) {

      defs
        .selectAll("pattern")
        .data(data)
        .join("pattern")
        .attr("id", d => "image-fill-" + d[map.image])
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("xlink:href", (d) => d[map.image])
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "xMidYMid slice");
    }

    const filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("color-interpolation-filters", "sRGB");

    filter.append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "0")
      .attr("stdDeviation", "3")
      .attr("flood-opacity", "0.3");

    ////////////////////////////////////////
    ////////////// Scales //////////////////
    ////////////////////////////////////////

    const yScale = d3.scaleBand()
      .domain(filteredData.map(d => d[map.y]))
      .range([0, height])
      .paddingInner(options.padding);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d[map.x]))
      .range([width / 2, 0])

    ////////////////////////////////////////
    ////////////// DOM Setup ///////////////
    ////////////////////////////////////////

    const bar_group = svg.selectAll(".bar_group")
      .data(filteredData, d => d[map.label])
      .join(
        enter => {
          return enter
            .append("g")
            .attr("transform", d => `translate(${width},${yScale(d[map.y])})`)
            .transition(t)
            .attr("transform", d => `translate(${xScale(d[map.x])},${yScale(d[map.y])})`)
        },
        update => {
          return update
            .transition(t)
            .attr("transform", d => `translate(${xScale(d[map.x])},${yScale(d[map.y])})`)
        },
        exit => {
          return exit
            .transition(t)
            .attr("transform", d => `translate(${-width},${yScale(d[map.y])})`)
            .remove()
        }
      )
      .style("pointer-events", "all")
      .classed("bar_group", true)
      .on("mouseover", function (event, d) {
        d3.select(this).lower()

        let textWidth = d3.select(this).select(".label").node().getBBox().width;
        tooltip_inner_group
          .transition()
          .attr("transform", x => d == x ? `translate(${textWidth + yScale.bandwidth() * (1 + options.padding)},0)` : `translate(${width + options.margin.left},0)`)
      })
      .on("mouseout", function (event, d) {

        let bounds = d3.select(this).node().getBoundingClientRect()

        if (event.clientX < bounds.x || event.clientX > bounds.x + bounds.width || event.clientY < bounds.y || event.clientY > bounds.y + bounds.height) {
          tooltip_inner_group
            .transition()
            .attr("transform", x => `translate(${width + options.margin.left},0)`)
        }

      });

    const tooltip_group = svg.selectAll(".tooltip_group")
      .data(filteredData, d => d[map.label])
      .join("g")
      .attr("transform", d => `translate(${xScale(d[map.x])},${yScale(d[map.y])})`)
      .classed("tooltip_group", true)

    const tooltip_inner_group = tooltip_group.selectAll(".tooltip_inner_group")
      .data(d => [d])
      .join("g")
      .attr("transform", d => `translate(${width + options.margin.left},0)`)
      .classed("tooltip_inner_group", true)

    const tooltip_rect = tooltip_inner_group.selectAll(".tooltip_rect")
      .data(d => [d])
      .join("rect")
      .attr("x", 0)
      .attr("y", yScale.bandwidth() * options.padding)
      .attr("height", yScale.bandwidth() * (1 - options.padding * 2))
      .attr("width", d => (yScale.bandwidth() * options.padding * 2) + options.stage_width + options.genre_width + (options.genre_width_padding * d[map.genre].length))
      .attr("rx", yScale.bandwidth() * (0.5 - options.padding))
      .attr("fill", options.tooltip_fill)
      .attr("stroke", options.tooltip_stroke)
      .classed("tooltip_rect", true)

    const stage_group = tooltip_inner_group.selectAll(".stage_group")
      .data(d => [d])
      .join("g")
      .attr("transform", `translate(${yScale.bandwidth() * options.padding},${yScale.bandwidth() * (options.padding * 1.5)})`)
      .classed("stage_group", true)

    const stage_rect = stage_group.selectAll(".stage_rect")
      .data(d => [d])
      .join("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", yScale.bandwidth() * (1 - options.padding * 3))
      .attr("width", options.stage_width)
      .attr("fill", options.tooltip_item_fill)
      .attr("rx", 6)
      .attr("stroke", options.stage_item_stroke)
      .classed("stage_rect", true)

    const stage_text = stage_group.selectAll(".stage_text")
      .data(d => [d])
      .join("text")
      .attr("x", options.stage_width / 2)
      .attr("y", yScale.bandwidth() * options.padding)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .text(d => d[map.stage])
      .classed("stage_text", true)


    const genre_group = tooltip_inner_group.selectAll(".genre_group")
      .data(d => [d])
      .join("g")
      .attr("transform", `translate(${options.stage_width + (yScale.bandwidth() * options.padding) * 2},${yScale.bandwidth() * (options.padding * 1.5)})`)
      .classed("genre_group", true)

    const genre_inner_group = genre_group
      .selectAll(".genre_inner_group")
      .data(d => d[map.genre])
      .join("g")
      .attr("transform", (d, i) => `translate(${i * options.genre_width_padding},${0})`)
      .classed("genre_inner_group", true)
      .on('mouseover', function () {

        genre_inner_group.each(function (d) {
          d3.select(this).raise()
        });

        d3.select(this).raise()
      });

    const genre_rect = genre_inner_group.selectAll(".genre_rect")
      .data(d => [d])
      .join("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", yScale.bandwidth() * (1 - options.padding * 3))
      .attr("width", options.genre_width)
      .attr("fill", options.tooltip_item_fill)
      .attr("rx", 3)
      .attr("stroke", options.stage_item_stroke)
      .classed("genre_rect", true)

    const genre_text = genre_inner_group.selectAll(".genre_text")
      .data(d => [d])
      .join("text")
      .attr("x", (d, i) => (options.genre_width / 2) + (i * options.genre_width_padding))
      .attr("y", yScale.bandwidth() * options.padding)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .text(d => d)
      .classed("genre_text", true)

    const bars = bar_group.selectAll(".bar")
      .data(d => [d])
      .join("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", d => width - xScale(d[map.x]))
      .attr("rx", yScale.bandwidth() / 2)
      .style("fill", d => "url(#gradient)")
      .classed("bar", true)

    const labels = bar_group.selectAll(".label")
      .data(d => [d])
      .join("text")
      .attr("x", d => yScale.bandwidth())
      .attr("y", d => yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .text(d => d[map.y] + ". " + d[map.label])
      .classed("label", true)

    const images = bar_group.selectAll(".image")
      .data(d => [d])
      .join("circle")
      .attr("cx", yScale.bandwidth() * 0.5)
      .attr("cy", yScale.bandwidth() * 0.5)
      .attr("r", yScale.bandwidth() * (0.5 - options.padding))
      .attr("fill", d => "url(#image-fill-" + d[map.image] + ")")
      .attr("filter", "url(#drop-shadow)")
      .classed("image", true)

  }

  update()

  return {
    update: update,
    svg: svg,
  }

};