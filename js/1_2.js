// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

// Description: Combined Bar Chart and Gauge

export function viz_1_2(data, map, options) {

  // temp data fix
  data.forEach(d => {
    if (d.platform == "Tiktok") d.platform = "TikTok"
    if (d.platform == "Youtube") d.platform = "YouTube"
  })

  let gender_data = data.filter(d => d.type == "gender")

  let bar_data = data.filter(d => d.type == "age")

  let mapping = {
    x: 'sub_type',
    y: "percentage",
  }

  map = { ...mapping, ...map };

  let defaults = {
    selector: '#viz_1_2',
  }

  options = { ...defaults, ...options };


  let platforms = {
    "TikTok": { color: "#99D8DB", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9668_tiktok-logo.svg" loading="lazy" width="30" alt="">' },
    "Instagram": { color: "#72A8DF", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c966a_instagram-logo.svg" loading="lazy" width="30" alt="">' },
    "YouTube": { color: "#E2B5FD", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9669_yt-logo.svg" loading="lazy" width="30" alt="">' }
  }

  gender_data.forEach(d => {
    d.color = d.sub_type == "Male Users" ? "#fff" : platforms[d.platform].color
  })


  let visuals = []
  let gauges = []

  Object.keys(platforms).forEach((d, i) => {

    if (d3.select(options.selector + "_" + d).empty()) d3.select(options.selector).append("div").attr("id", options.selector.substring(1) + "_" + d)

    options.fill = platforms[d].color
    let vis = barchart_1_2(bar_data.filter(e => e.platform == d), map, { selector: options.selector + "_" + d, fill: platforms[d].color })
    let g = gauge_1_2(gender_data.filter(e => e.platform == d), { value: "percentage", label: "sub_type", fill: "color" }, { selector: options.selector + "_" + d, fill: platforms[d].color })
    visuals.push(vis)
    gauges.push(g)

  });

  function update() {
    console.log("no update function for viz_1_2 yet!")
  }

  return {
    update: update
  }
}

////////////////////////////////////////
///////////// Bar Chart ////////////////
////////////////////////////////////////

function barchart_1_2(data, map, options) {

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
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 300,
    height: 200,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    padding: 0.02,
    fill: "#69b3a2",
    stroke: "#000",
    label_offset: 30,
    focus: null,
    sort: [],
    direction: 1,
    domain: [0, 0.6]
  }

  // merge default options with user options
  options = { ...defaults, ...options };

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

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const xScale = d3.scaleBand()
    .domain(data.map(d => d[map.x]))
    .range([0, width])
    .paddingInner(options.padding);

  const yScale = d3.scaleLinear()
    .domain(options.domain.length > 0 ? options.domain : [0, d3.max(data, d => d[map.y])])
    .range([height, 0])

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const value_labels = svg.selectAll(".value-label")
    .data(data)
    .join("text")
    .attr("x", d => xScale(d[map.x]) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d[map.y]) - 5)
    .attr("opacity", 0)
    .text(d => d3.format(".0%")(d[map.y]))
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .classed("value-label", true);

  const bars = svg.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("x", d => xScale(d[map.x]))
    .attr("y", d => yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(0))
    .style("fill", options.fill)
    .attr("stroke", d => "none")
    .classed("bar", true)
    .on("mouseover", function (event, d) {
      d3.select(this).style("fill", d3.color(options.fill).brighter(0.2));
      d3.select(this.parentNode).selectAll(".value-label").filter(e => e[map.x] == d[map.x]).attr("opacity", 1);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).style("fill", options.fill);
      d3.select(this.parentNode).selectAll(".value-label").filter(e => e[map.x] == d[map.x]).attr("opacity", 0);
    })

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

    bars
      .transition(t)
      .delay((d, i) => i * options.delay)
      .attr("y", d => map.y ? yScale(d[map.y]) : yScale(0))
      .attr("height", d => map.y ? height - yScale(d[map.y]) : height - yScale(0));
  }

  update()

  return {
    update: update,
    svg: svg,
  }

};

////////////////////////////////////////
//////////////// Gauge /////////////////
////////////////////////////////////////

function gauge_1_2(data, map, options) {

  ////////////////////////////////////////
  ////////////// Defaults ////////////////
  ////////////////////////////////////////

  let mapping = {
    label: 'label',
    value: 'value',
    fill: null,
  }

  let defaults = {
    selector: '#gauge',
    width: 800,
    height: 600,
    margin: { top: 50, right: 100, bottom: 200, left: 100 },
    fill: "#69b3a2",
    min: 0,
    max: 1,
    value: 0.5,
    transition: 1000,
    format: ".0%",
    barwidth: 100,
    legend: ['left', 'right']
  };

  // Merge default options with user options
  options = { ...defaults, ...options };


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
    .attr('transform', `translate(${options.width / 2}, ${options.height - options.margin.bottom})`);


  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Gradients ///////////////
  ////////////////////////////////////////

  let defs = svg.append("defs");

  //Filter for the outside glow
  var blur = defs.append("filter")
    .attr("id", options.selector.substring(1) + "-blur")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("height", "200%")
    .attr("width", "200%")
  blur.append("feGaussianBlur")
    .attr("stdDeviation", "50")
    .attr("result", "coloredBlur");

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const scale = d3.scaleLinear()
    .domain([options.min, options.max])
    .range([-Math.PI / 2, Math.PI / 2]);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const background = svg.append("circle")
    .attr("r", options.width * 0.25)
    .attr("cx", 0)
    .attr("cy", -options.height * 0.25)
    .attr("fill", options.fill)
    .attr("fill-opacity", 0.5)
    .style("filter", `url(${options.selector}-blur)`)

  // Background Arc
  let arc = d3.arc()
    .innerRadius((options.width - options.margin.right - options.margin.left) / 2 - options.barwidth)
    .outerRadius((options.width - options.margin.right - options.margin.left) / 2)
    .startAngle(-Math.PI / 2)

  const backgroundPath = svg.append('path')
    .attr('d', arc({ endAngle: scale(0) }))
    .attr('fill', '#fff');

  const foregroundPath = svg
    .selectAll('.foreground-path')
    .data(data)
    .join('path')
    .attr('d', arc({ endAngle: scale(0) }))
    .attr('fill', d => map.fill != null ? d[map.fill] : options.fill)
    .classed('foreground-path', true);

  const labels = svg.selectAll('.label')
    .data(data)
    .join('text')
    .attr('text-anchor', 'middle')
    .attr('x', (d, i) => i == 0 ? (width / 2) - (options.barwidth / 2) : (-width / 2) + (options.barwidth / 2))
    .attr('y', -20)
    .attr('fill', '#000')
    .attr('font-size', '30px')
    .attr('font-weight', 'bold')
    .text(d => d3.format(options.format)(d[map.value]))
    .classed('label', true)

  ////////////////////////////////////////
  /////////////// Legend /////////////////
  ////////////////////////////////////////

  svg.selectAll('.legend_text')
    .data(data)
    .join("text")
    .attr('x', (d, i) => i == 0 ? (width / 2) - (options.barwidth / 2) : (-width / 2) + (options.barwidth / 2))
    .attr('y', 30)
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text(d => d[map.label])
    .classed('legend_text', true)

  ////////////////////////////////////////
  /////////////// Update /////////////////
  ////////////////////////////////////////
  function update() {

    backgroundPath
      .transition()
      .duration(options.transition)
      .attrTween('d', function () {
        var i = d3.interpolate(scale(0), scale(1));
        return function (t) {
          return arc({ endAngle: i(t) });
        }
      });

    foregroundPath
      .transition()
      .duration(options.transition)
      .attrTween('d', function (d) {
        var i = d3.interpolate(scale(0), scale(d[map.value]));
        return function (t) {
          return arc({ endAngle: i(t) });
        }
      });
  }

  update()

  return {
    svg: svg,
    update: update
  };
}
