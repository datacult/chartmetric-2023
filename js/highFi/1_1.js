
export function sankey(data = [], map, options) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    fill: null,
    stroke: null,
    source: "source",
    target: "target",
    value: "value",
  };

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: "#vis",
    width: 1200,
    height: 800,
    margin: { top: 200, right: 200, bottom: 200, left: 200 },
    transition: 1500,
    delay: 100,
    fill: "#69b3a2",
    stroke: "#000",
    align: "justify",
    nodeWidth: 30,
    padding: 100,
    colors: d3.scaleOrdinal(d3.schemeCategory10),
  };

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const div = d3.select(options.selector);

  const container = div.append("div").classed("vis-svg-container", true);

  const svg = container
    .append("svg")
    .attr("width", "100%") // Responsive width
    .attr("height", "100%") // Responsive height
    .attr("viewBox", `0 0 ${options.width} ${options.height}`)
    .classed("vis-svg", true)
    .append("g")
    .attr(
      "transform",
      `translate(${options.margin.left},${options.margin.top})`
    );

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ///////////// Transform ////////////////
  ////////////////////////////////////////

  let link_data = data.map(d => {
    return {
      source: d[map.source],
      target: d[map.target],
      value: d[map.value]
    }
  })

  let node_data = Array.from(new Set(data.map((d) => [d[map.source], d[map.target]]).flat())).map((d) => { return { name: d } })


  ////////////////////////////////////////
  /////////////// Scales /////////////////
  ////////////////////////////////////////

  const colorScale = d3
    .scaleOrdinal()
    .domain([2023, 2022, "Prior", "All Time"])
    .range(["#EB6AF5", "#FE7225", "#FFD966", "#1681F7"]);

  ////////////////////////////////////////
  //////////// Sankey Setup //////////////
  ////////////////////////////////////////

  const sankey = d3.sankey()
    .nodeId((d) => d.name)
    .nodeAlign(d3.sankeyLeft)
    .nodeWidth(options.nodeWidth)
    .nodePadding(options.padding)
    .size([height, width])
    .nodeSort((a, b) => d3.descending(a.value, b.value));

  const { nodes, links } = sankey({ nodes: node_data, links: link_data })

  const defs = svg.append("defs");

  let gradients = defs.selectAll("linearGradient")
    .data(links)
    .join("linearGradient")
    .attr("id", (d) => d.source.name)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")

  gradients
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d => colorScale(d.source.name))
    .attr("stop-opacity", 1)

  gradients
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d => colorScale(d.target.name))
    .attr("stop-opacity", 0.5)

  ////////////////////////////////////////
  /////////////// DOM Setup //////////////
  ////////////////////////////////////////

  const plot = svg
    .append("g")
    .attr("class", "sankey")
    .attr("transform", `translate(${0}, ${width / 2}) rotate(-90, ${0}, ${0})`);

  let nodeBlocks = plot
    .append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", sankey.nodeWidth())
    .attr("fill", (d) => colorScale(d.name));

  let sourceNames = plot
    .append("g")
    .selectAll("text")
    .data(links)
    .join("text")
    .attr("x", (d) => d.source.x0 - options.nodeWidth)
    .attr("y", (d) => (d.source.y1 + d.source.y0) / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "2rem")
    .style("font-weight", "700")
    .style("fill", "#C2C2C1")
    .style("dominant-baseline", "middle")
    .text((d) => d.source.name)
    .attr("transform", (d) => {
      const x = d.source.x0 - options.nodeWidth;
      const y = (d.source.y1 + d.source.y0) / 2
      return `rotate(90, ${x}, ${y})`;
    })

  let sourceValues = plot
    .append("g")
    .selectAll("text")
    .data(links)
    .join("text")
    .attr("x", (d) => d.source.x0 - options.nodeWidth - 40)
    .attr("y", (d) => (d.source.y1 + d.source.y0) / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "2rem")
    .style("font-weight", "700")
    .style("fill", "#1C1C1C")
    .style("dominant-baseline", "middle")
    .attr("transform", (d) => {
      const x = d.source.x0 - options.nodeWidth - 40;
      const y = (d.source.y1 + d.source.y0) / 2
      return `rotate(90, ${x}, ${y})`;
    })
    .transition()
    .duration(options.transition)
    .tween("text", (d) => {
      const interpolator = d3.interpolateNumber(0, d.source.value);
      return function(t) {
        d3.select(this).text(d3.format(".3s")(interpolator(t)))
      }
    });
    


  let targetName = plot
    .append("g")
    .selectAll("text")
    .data(nodes.filter(d => d.sourceLinks.length === 0))
    .join("text")
    .attr("x", (d) => d.x0 + (options.nodeWidth * 2) + 80)
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "2rem")
    .style("font-weight", "700")
    .style("fill", "#C2C2C1")
    .style("dominant-baseline", "middle")
    .text((d) => d.name)
    .attr("transform", (d) => {
      const x = d.x0 + (options.nodeWidth * 2) + 80;
      const y = (d.y1 + d.y0) / 2
      return `rotate(90, ${x}, ${y})`;
    })

  let targetValue = plot
    .append("g")
    .selectAll("text")
    .data(nodes.filter(d => d.sourceLinks.length === 0))
    .join("text")
    .attr("x", (d) => d.x0 + (options.nodeWidth * 2) + 20)
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "4rem")
    .style("font-weight", "700")
    .style("fill", "#1C1C1C")
    .style("dominant-baseline", "middle")
    .attr("transform", (d) => {
      const x = d.x0 + (options.nodeWidth * 2) + 20;
      const y = (d.y1 + d.y0) / 2
      return `rotate(90, ${x}, ${y})`;
    })
    .transition()
    .duration(options.transition)
    .tween("text", (d) => {
      const interpolator = d3.interpolateNumber(0, d.value);
      return function(t) {
        d3.select(this).text(d3.format(",")(Math.round(interpolator(t))))
      }
    });
    


  plot
    .append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", (d) => `url(#${d.source.name})`)
    .attr("stroke-width", (d) => Math.max(1, d.width))
    .style("mix-blend-mode", "multiply");

  ////////////////////////////////////////
  /////////////// Update /////////////////
  ////////////////////////////////////////

  function update() {
    console.log("update for sankey chart not implemented yet.")
  }

  return {
    update: update,
  };
}
