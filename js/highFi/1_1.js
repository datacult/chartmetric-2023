
export function sankey(data = [], map, options) {

  console.log(data)

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
    transition: 400,
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


  // Create the linearGradient element
  const gradients = [
    {
      id: 2023,
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "100%",
      stops: [
        { offset: "0.4", color: "#EB6AF5" },
        { offset: "0.494792", color: "#D2CFF2", opacity: "0.970312" },
        { offset: "1", color: "#BFDBF9", opacity: "0.94" },
      ],
    },
    {
      id: 2022,
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "100%",
      stops: [
        { offset: "0.4", color: "#FE7225" },
        { offset: "0.494792", color: "#CCCCCC" },
        { offset: "1", color: "#BADAFF", opacity: "0.73" },
      ],
    },
    {
      id: "Prior",
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "100%",
      stops: [
        { offset: "0.4", color: "#FFD966" },
        { offset: "0.581186", color: "#DDE6E6" },
        { offset: "1", color: "#A9D2FF" },
      ],
    },
  ];

  const defs = svg.append("defs");

  gradients.forEach((gradientData) => {
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", gradientData.id)
      .attr("x1", gradientData.x1)
      .attr("y1", gradientData.y1)
      .attr("x2", gradientData.x2)
      .attr("y2", gradientData.y2)
      .attr("gradientUnits", "objectBoundingBox")
      .attr("gradientTransform", "rotate(-45,0.5,0.5) translate(0, -.4)")
    gradientData.stops.forEach((stop) => {
      linearGradient
        .append("stop")
        .attr("offset", stop.offset)
        .attr("stop-color", stop.color)
        .attr("stop-opacity", stop.opacity || null);
    });
  });

  const colorScale = d3
    .scaleOrdinal()
    .domain([2023, 2022, "Prior", "All Time"])
    .range(["#EB6AF5", "#FE7225", "#FFD966", "#1681F7"]);

  const sankey = d3.sankey()
    .nodeId((d) => d.name)
    .nodeAlign(d3.sankeyLeft)
    .nodeWidth(options.nodeWidth)
    .nodePadding(options.padding)
    .size([height, width])
    .nodeSort((a, b) => d3.descending(a.value, b.value));

  /***********************
   *5. Draw canvas
   ************************/

  const plot = svg
    .append("g")
    .attr("class", "sankey")
    .attr("transform", `translate(${0}, ${width / 2}) rotate(-90, ${0}, ${0})`);

  const { nodes, links } = sankey({ nodes: node_data, links: link_data })

  console.log(nodes, links)

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
    .style("font", "Inter")
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
    .style("font", "Inter")
    .style("font-size", "2rem")
    .style("font-weight", "700") 
    .style("fill", "#1C1C1C")
    .style("dominant-baseline", "middle")
    .text((d) => d3.format(".3s")(d.source.value))
    .attr("transform", (d) => {
      const x = d.source.x0 - options.nodeWidth - 40;
      const y = (d.source.y1 + d.source.y0) / 2
      return `rotate(90, ${x}, ${y})`;
    })


  let targetName = plot
    .append("g")
    .selectAll("text")
    .data(nodes.filter(d => d.sourceLinks.length === 0))
    .join("text")
    .attr("x", (d) => d.x0 + (options.nodeWidth * 2) + 80)
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("text-anchor", "middle")
    .style("font", "Inter")
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
    .style("font", "Inter")
    .style("font-size", "4rem")
    .style("font-weight", "700") 
    .style("fill", "#1C1C1C")
    .style("dominant-baseline", "middle")
    .text((d) => d3.format(",")(d.value))
    .attr("transform", (d) => {
      const x = d.x0 + (options.nodeWidth * 2) + 20;
      const y = (d.y1 + d.y0) / 2
      return `rotate(90, ${x}, ${y})`;
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

  function update() {
    console.log("update for sankey chart not implemented yet.")
  }

  return {
    update: update,
  };
}
