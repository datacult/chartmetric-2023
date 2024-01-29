import { chartDimensions, setupResponsiveDimensions } from "../utility.js";
// Usage Example

export function Sankey(data = [], selector = "vis", dimensions) {
  const nodeId = "source";

  /***********************
   *1. Access data
   ************************/
  data = {
    nodes: [
      {
        name: "All Time",
      },
      {
        name: "2023",
      },
      {
        name: "2022",
      },
      {
        name: "Prior",
      },
    ],
    links: [
      {
        source: "All Time",
        target: "2023",
        value: 17161101,
      },
      {
        source: "All Time",
        target: "2022",
        value: 29400000,
      },
      {
        source: "All Time",
        target: "Prior",
        value: 57300000,
      },
    ],
  };

  const format = () => {
    const f = d3.format(",.0f");
    return (d) => `${f(d)} PLN`;
  };

  function update(newDimensions) {
    let height = Math.min(newDimensions.width, newDimensions.height);
    let width = height * 1.5;
    console.log(newDimensions);
    /***********************
     *2. Create chart dimensions
     ************************/
    const padding_chart = (height * 150) / 700,
      padding = 120;
    const widthChart = width - padding_chart * 2,
      heightChart = height - padding_chart * 1.25;

    let cx = widthChart / 2 + padding_chart / 2;
    let cy = heightChart / 2 + padding_chart / 2;
    /***********************
     *3. Set up canvas
     ************************/
    const visElement = document.getElementById(selector);

    const svg = d3
      .select(visElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    /***********************
     *4. Create scales
     ************************/
    const sankey = d3
      .sankey()
      .nodeId((d) => d.name)
      .nodeAlign(d3.sankeyLeft)
      .nodeWidth(5)
      .nodePadding(padding)
      .extent([
        [1, 1],
        [heightChart, widthChart - 1],
      ])
      .nodeSort((a, b) => d3.descending(a.value, b.value));
    /***********************
     *5. Draw canvas
     ************************/

    const plot = svg
      .append("g")
      .attr("class", "sankey")
      .attr(
        "transform",
        `translate(${padding_chart * 1.5}, ${
          padding_chart * 1.5
        }) rotate(90, ${cx}, ${cy})`
      );

    const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
      nodes: data.nodes.map((d) => Object.assign({}, d)),
      links: data.links.map((d) => Object.assign({}, d)),
    });

    const link = plot
      .append("g")
      .attr("class", "links")
      .attr("fill", "none")
      .selectAll("g")
      .data(sankeyLinks)
      .join("g")
      .attr("opacity", 0.4)
   
      .style("mix-blend-mode", "multiply");

      const defs = svg.append("defs");

      // Create the linearGradient element
      const gradients = [
        {
          id: "2023",
          x1: "0%",
          y1: "0%",
          x2: "100%",
          y2: "0%",
          stops: [
            { offset: "0", color: "#BFDBF9" },
            { offset: "0.000002", color: "#D2CFF2", opacity: "0.970312" },
            { offset: "1", color: "#EB6AF5", opacity: "0.94" },
          ],
        },
        {
          id: "2022",
          x1: "0%",
          y1: "0%",
          x2: "100%",
          y2: "0%",
          stops: [
            { offset: "0", color: "#BADAFF" },
            { offset: "0.494792", color: "#CCCCCC" },
            { offset: "1", color: "#FE7225", opacity: "0.73" },
          ],
        },
        {
          id: "Prior",
          x1: "0%",
          y1: "0%",
          x2: "100%",
          y2: "0%",
          stops: [
            { offset: "0", color: "#A9D2FF" },
            { offset: "0.581186", color: "#DDE6E6" },
            { offset: "1", color: "#FFD966" },
          ],
        },
      ];

      const colorScale = d3.scaleOrdinal().domain(["2023", "2022", "Prior", "All Time"]).range(["#EB6AF5", "#FE7225", "#FFD966", "#1681F7"]);
      // Create gradients
      gradients.forEach((gradientData) => {
        const linearGradient = defs
          .append("linearGradient")
          .attr("id", gradientData.id)
          .attr("x1", gradientData.x1)
          .attr("y1", gradientData.y1)
          .attr("x2", gradientData.x2)
          .attr("y2", gradientData.y2)
          .attr("gradientUnits", "userSpaceOnUse");
      
        gradientData.stops.forEach((stop) => {
          linearGradient
            .append("stop")
            .attr("offset", stop.offset)
            .attr("stop-color", stop.color)
            .attr("stop-opacity", stop.opacity || null);
        });
      });

    link
      .append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", (d, i) => {
        console.log(d.target.name)
        return `url(#${d.target.name})`
      })
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
      .attr("width", (d) =>Math.min(30,( d.x1 - d.x0)*10))

      .attr("fill", d=> colorScale(d.name))
      .append("title");
    // .text((d) => `${d[nodeId]}\n${d.value.toLocaleString()}`);

    const nodeText = plot
      .append("g")
      .style("font", "2rem Inter")
      .attr("transform", "translate(50, 0)")
      .selectAll("text")
      .data(sankeyNodes)
      .join("text")
      .style("fill", (d) => "#C2C2C1")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 : d.x0))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", (d) => (d.value === 103861101 ? "-4.5em" : "1em"))
      .style("text-edge", "cap")
      .attr("font-weight", "700")
      .attr("transform", (d) => {
        const x = d.x1;
        const y = 5 + (d.y1 + d.y0) / 2;
        return `rotate(270, ${x}, ${y})`;
      })
      .attr("text-anchor", (d) => "middle")
      .text((d) => d.name);

    const nodeNumber = plot
      .append("g")
      .style("font", "2rem Inter")
      .selectAll("text")
      .data(sankeyNodes)
      .join("text")
      .style("fill", (d) => "#1C1C1C")
      .style("text-edge", "cap")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", (d) => (d.value === 103861101 ? "-.5em" : "1em"))
      .attr("font-weight", "700")
      .attr("font-size", (d) => (d.value === 103861101 ? "4rem" : "2rem"))
      .attr("transform", (d) => {
        const x = d.x1;
        const y = 5 + (d.y1 + d.y0) / 2;

        return `rotate(270, ${x}, ${y})`;
      })
      .attr("text-anchor", (d) => "middle")
      .text((d) =>
        d.value === 103861101
          ? `${d3.format(",")(d.value)}`
          : `${d3.format(".3s")(d.value)}`
      );
  }

  update(dimensions);

  return {
    update: update,
  };
}

let aspectiveRatio = 1.5;
export let updateFn;

setupResponsiveDimensions(
  "vis",
  { top: 10, right: 20, bottom: 10, left: 20 },
  (dimensions) => {
    if (d3.select("#vis svg").empty()) {
      updateFn = Sankey([], "vis", dimensions);
    } else {
      // Redraw or update your data visualization here
      d3.select("#vis svg").remove();
      // updateFn = Sankey([], 'vis', dimensions);

      updateFn.update(dimensions);
    }
  }
);
