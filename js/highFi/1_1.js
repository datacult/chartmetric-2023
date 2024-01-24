import { chartDimensions } from "../utility.js";

export async function Sankey(data = [], chartContainerId = "vis") {
  const nodeId = "source";
  const padding = 100;
  const padding_chart = 105;
  /***********************
   *1. Access data
   ************************/

  data.push({
    TIMEFRAME: "Prior",
    ARTISTS_ADDED:
      d3.max(data, (d) => d.ARTISTS_ADDED) -
      d3.sum(
        data.filter((d) => d.TIMEFRAME != "All Time"),
        (d) => d.ARTISTS_ADDED
      ),
  });
  let links = data
    .filter((element) => element.TIMEFRAME !== "All Time")
    .map((element) => {
      return {
        source: "All Time",
        target: element.TIMEFRAME.toString(),
        value: element.ARTISTS_ADDED,
      };
    });
  const nodeByName = new Map();
  for (const link of links) {
    if (!nodeByName.has(link.source))
      nodeByName.set(link.source, { name: link.source });
    if (!nodeByName.has(link.target))
      nodeByName.set(link.target, { name: link.target });
  }

  const nodes = Array.from(nodeByName.values());
  const dataset = { nodes, links };

  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth: width, boundedHeight: height } =
    chartDimensions(chartContainerId);
  const widthChart = width - padding_chart * 2,
    heightChart = height - padding_chart * 1.25;
  let cx = widthChart / 2 + padding_chart / 2;
  let cy = heightChart / 2 + padding_chart / 2;
  /***********************
   *3. Set up canvas
   ************************/
  const visElement = document.getElementById(chartContainerId);
  const svg = d3
    .select(visElement)
    .append("svg")
    .attr("width", '100%')
    .attr("height", '100%');

  /***********************
   *4. Create scales
   ************************/
  const sankey = d3
    .sankey()
    .nodeId((d) => d.name)
    .nodeAlign(d3.sankeyJustify)
    .nodeWidth(5)
    .nodePadding(padding)
    .extent([
      [1, 1],
      [heightChart, widthChart - 1],
    ])
    .nodeSort((a, b) => {
      b.value - a.value;
    });
  /***********************
   *5. Draw canvas
   ************************/

  const plot = svg
    .append("g")
    .attr("class", "sankey")
    .attr(
      "transform",
      `translate(${padding_chart * 2}, ${
        padding_chart * 3
      }) rotate(90, ${cx}, ${cy})`
    );

  const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
    nodes: dataset.nodes.map((d) => Object.assign({}, d)),
    links: dataset.links.map((d) => Object.assign({}, d)),
  });

  const link = plot
    .append("g")
    .attr("class", "links")
    .attr("fill", "red")
    .selectAll("g")
    .data(sankeyLinks)
    .join("g")
    .attr("opacity", 0.4)
    .attr("stroke", (d) => {
      return "black";
    })
    .style("mix-blend-mode", "multiply");

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  // gradient link
  const gradient = link
    .append("linearGradient")
    .attr("id", (d) => `link-gradient-${d.source.name}-${d.target.name}`)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", (d) => d.source.x1)
    .attr("x2", (d) => d.target.x0);
  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", (d) => color(d.source.name));
  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", (d) => color(d.target.name));

  link
    .append("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr(
      "stroke",
      (d, i) => `url(#link-gradient-${d.source.name}-${d.target.name})`
    )
    .attr("stroke-width", (d) => Math.max(1, d.width));

  // rect bar
  plot
    .append("g")
    .attr("class", "nodes")
    .selectAll("rect")
    .data(sankeyNodes)
    .join("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("stroke", (d) => "red")
    .attr("fill", (d) => "red")
    .append("title");
  // .text((d) => `${d[nodeId]}\n${d.value.toLocaleString()}`);

  plot
    .append("g")
    .style("font", "10px sans-serif")
    .attr("transform", "translate(-30, 0)")
    .selectAll("text")
    .data(sankeyNodes)
    .join("text")
    .style("fill", (d) => "red")
    .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("transform", (d) => {
      const x = d.x1;
      const y = 5 + (d.y1 + d.y0) / 2;

      return `rotate(270, ${x + 20}, ${y})`;
    })
    .attr("text-anchor", (d) => "start")
    .text((d) => d.name)
    .append("tspan")
    .attr("fill-opacity", 0.8)
    .text((d) => ` ${d.value.toLocaleString()}`);

  return function update() {};
}
