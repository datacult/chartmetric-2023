import { chartDimensions } from "../chartDimensions.js";
export function drawSingleValues(triggerElementId) {
  const metaDataGenerator = (width, height) => [
    {
      group: "Chartmetric daily artists ingested",
      size: 3670,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: -width * 0.31, y: height * -0.12 }
          : { x: 0, y: height * -0.3 },

      icon: "🎵",
    },
    {
      group: "NFL players",
      size: 1696,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: width * 0.025, y: height * -0.22 }
          : { x: 0, y: height * 0.02 },

      icon: "🏈",
    },
    {
      group: "MLB players",
      size: 975,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: width * 0.23, y: height * 0.15 }
          : { x: 0, y: height * 0.25 },

      icon: "⚾",
    },
    {
      group: "NBA players",
      size: 540,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: width * 0.386, y: height * -0.094 }
          : { x: 0, y: height * 0.42 },

      icon: "🏀",
    },
  ];
  const chartId = "dailyIngestionFunFactBubbles_Chart";
  const chartContainerId = "dailyIngestionFunFactBubbles_ChartContainer";
  let subgroupRadius = 2.5;
  const padding = 1;

  const container = document.querySelector("#" + chartContainerId);
  const canvas = document.createElement("canvas");

  canvas.setAttribute("id", chartId);

  container.appendChild(canvas);
  const svg = d3
    .select("#" + chartContainerId)
    .append("svg")
    .style("width", "100%")
    .style("height", "100%")
    .attr("id", "svgdailyIngestionFunFactBubbles_textContainer")
    .attr("z-index", 1000);
  const { boundedWidth, boundedHeight } = chartDimensions(chartContainerId);
  let meta = metaDataGenerator(boundedWidth, boundedHeight);
  const groups = meta.map((d) => d.group);
  let movedCircles = [];

  const colorScale = d3.scaleOrdinal(groups, [
    "#1B81F7",
    "#FC803B",
    "#FEC641",
    "#EC76F4",
  ]);

  // const texts = svg
  //   .selectAll("text")
  //   .data(meta)
  //   .join("text")
  //   .attr("class", "text-single-values")
  //   .attr("x", boundedWidth / 2)
  //   .attr("y", boundedHeight / 2)
  //   .attr("stroke", "rgba(255, 255, 255, 0.95)")
  //   .attr("stroke-width", 9)
  //   .attr("stroke-linecap", "round")
  //   .attr("stroke-linejoin", "round")
  //   .attr("paint-order", "stroke")
  //   .text((d) => d.group);

  let iconSize = "65px";
  const textContainer = svg
    .selectAll("g")
    .data(meta)
    .join("g")
    .attr("class", "text-container-single-values");
  // text
  textContainer
    .append("text")
    .attr("class", "text-single-values")
    .attr("stroke", "rgba(255, 255, 255, 0.95)")
    .attr("stroke-width", 9)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("paint-order", "stroke")

    .attr("dy", "2.5em")
    .each(function (d) {
      const text = d3.select(this);
      let lines = [];

      // Check if the text needs to be split and split it

      if (d.group === "Chartmetric daily artists ingested") {
        text.text("Chartmetric daily artists \ningested");
        // lines = ["Chartmetric daily artists", "ingested"];
        // // Append tspan elements for each line
        // lines.forEach((line, i) => {
        //   text
        //     .append("tspan")
        //     .attr("x", boundedWidth / 2)
        //     .attr("dy", i === 0 ? 0 : "1.2em") // adjust vertical position of lines
        //     .text(line);
        // });
      } else {
        text.text(d.group);
      }
    });
  // icon
  textContainer
    .append("foreignObject")
    .attr("width", iconSize)
    .attr("height", iconSize)
    .append("xhtml:div")
    .attr("class", "iconBackground-single-values")
    .style("font-size", "40px")
    .style("height", iconSize)
    .html((d) => `${d.icon}`);
  // Adjust the x position of each text based on its width
  // texts.each(function () {
  //   const textWidth = this.getBBox().width;
  //   d3.select(this).attr("x", boundedWidth / 2 - textWidth / 2);
  // });
  function resizeCanvas() {
    const scale = window.devicePixelRatio;
    console.log(scale);
    const { boundedWidth: width, boundedHeight: height } =
      chartDimensions(chartContainerId);
    canvas.width = width * scale;
    canvas.height = height * scale;
    let context = canvas.getContext("2d");
    context.scale(scale, scale);
    meta = metaDataGenerator(width, height);

    context.translate(width / 2, height * 0.5);
    // create new movedCircles array
    movedCircles.length = 0;
    subgroupRadius = width > 760 ? (2 / 1300) * width : 0.8;
    groups.forEach((group) => {
      const currentGroup = meta.find((d) => d.group == group);
      movedCircles.push(
        d3.packSiblings(
          d3.range(currentGroup.size).map(() => ({
            r: subgroupRadius + padding + Math.random(),
            group: group,
            fill: colorScale(group),
          }))
        )
      );

   
    });
    movedCircles.forEach(dataset => {
      let xExtent = d3.extent(dataset, d=>d.x)
      let radius = Math.abs((xExtent[1] - xExtent[0])/2)
      dataset.radius = radius
      dataset.dataset = dataset
    })
    drawCircles(context, width, height);

    let tl = gsap.timeline({ paused: true });
    meta.forEach((groupMeta) => {
      tl.to(
        groupMeta.offsetXY,
        {
          x: groupMeta.targetXY.x,
          y: groupMeta.targetXY.y,
          duration: 1,
          stagger: 0.1,
          ease: "expo.in",
          // Use a common onUpdate callback for all tweens
          onUpdate: () => drawCircles(context, width, height),
        },
        0
      );
      // text animation
      // tl.fromTo(
      //   ".text-single-values",
      //   { opacity: 0, attr: { x: width / 2, y: height / 2 } },
      //   {
      //     opacity: 1,
      //     duration: 1,
      //     ease: "expo.in",

      //     attr: {
      //       x: (index) => {
      //         let textElement = d3.selectAll(".text-single-values").nodes()[
      //           index
      //         ];
      //         const textWidth = textElement.getBBox().width;
      //         return meta[index].targetXY.x + width / 2 - textWidth / 2;
      //       },
      //       y: (index) => meta[index].targetXY.y + height / 2,
      //       dy: "1em",
      //     },
      //   },
      //   "0"
      // );
      // icon animation
      tl.fromTo(
        ".text-container-single-values",
        {
          opacity: 0,
          attr: {
            transform: `translate(${width / 2}, ${height / 2})`,
          },
        },
        {
          opacity: 1,
          duration: 1,
          ease: "expo.in",
          attr: {
            transform: (index) => {
              let textElement = d3
                .selectAll(".text-container-single-values")
                .nodes()[index];
              const textWidth = textElement.getBBox().width;
              
              const x = meta[index].targetXY.x + width / 2 - textWidth / 2;
              const y = meta[index].targetXY.y + height / 2;
              if (meta[index].group === "Chartmetric daily artists ingested") {
                return `translate(${x-15}, ${y})`;
              } else {
                return `translate(${x}, ${y})`;
              }
             
            },
          },
        },
        "0"
      ).to("foreignObject", {
        duration: 0.1,
        attr: {
          transform: (index, b) => {
            let textElement = d3
              .selectAll(".text-container-single-values")
              .nodes()[index];
            const { width: textWidth, height: textHeight } =
              textElement.getBBox();
            if (meta[index].group === "Chartmetric daily artists ingested") {
              return `translate(${textWidth*.5-20}, ${-textHeight / 2})`;
            } else {
              const x = textWidth / 8;
              const y = -textHeight / 2;
              return `translate(${x}, ${y})`;
            }
          },
        },
      });
    });
    ScrollTrigger.create({
      trigger: "#" + triggerElementId,
      start: "top bottom",
      onEnter: ({ progress }) => {
        tl.play();
      },
    });
  }

  function drawCircles(context, width, height) {
    context.clearRect(-width / 2, -height / 2, width, height);
    movedCircles.forEach(({dataset}) => {
      dataset.forEach((circle) => {
        let groupMeta = meta.find((m) => m.group === circle.group);
        context.beginPath();
        context.arc(
          circle.x + groupMeta.offsetXY.x,
          circle.y + groupMeta.offsetXY.y,
          circle.r - padding,
          0,
          2 * Math.PI
        );
        context.fillStyle = circle.fill;
        context.fill();
      });
    });
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}
