import { chartDimensions } from "../utility.js";
export function drawSingleValues(triggerElementId) {
  const metaDataGenerator = (width, height) => [
    {
      group: "Chartmetric daily artists ingested",
      size: 3642,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: -width * 0.2777, y: height * -0.03 }
          : window.devicePixelRatio == 2 ? { x: 0, y: height * -0.4 } : { x: 0, y: height * -0.39 },

      icon: "🎵",
    },
    {
      group: "NFL players",
      size: 1696,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: width * 0.0707, y: width < 1200 ? height * 0.3 : height * 0.18 }
          : window.devicePixelRatio == 2 ? { x: 0, y: height * -.15 } : { x: 0, y: height * -0.1 },

      icon: "🏈",
    },
    {
      group: "MLB players",
      size: 780,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: width * 0.34795, y: height * 0.04116 }
          : window.devicePixelRatio == 2 ? { x: 0, y: height * .1 } : { x: 0, y: height * .12 },

      icon: "⚾",
    },
    {
      group: "NHL players",
      size: 736,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: width * 0, y: width < 1200 ? height * -0.35 : height * -0.3 }
          : window.devicePixelRatio == 2 ? { x: 0, y: height * .3 } : { x: 0, y: height * .31 },

      icon: "🏒",
    },
    {
      group: "NBA players",
      size: 450,
      offsetXY: { x: 0, y: 0 },
      targetXY:
        width > 760
          ? { x: width * 0.20175, y: height * -0.2188 }
          : { x: 0, y: height * 0.48 },

      icon: "🏀",
    },
  ];
  const chartId = "dailyIngestionFunFactBubbles_Chart";
  const chartContainerId = triggerElementId;
  let subgroupRadius = 2;
  let padding = 2.2;

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
    "#FEC641",
    "#FF7324",
    "#EC76F4",
    "#26BDB9",
  ]);


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

  let width, height;

  function resizeCanvas() {

    const scale = window.devicePixelRatio;
    const { boundedWidth, boundedHeight } = chartDimensions(chartContainerId);

    if (width != boundedWidth || height != boundedHeight) {

      console.log(`old width: ${width}, new width: ${boundedWidth} old height: ${height}, new height: ${boundedHeight}`)

      width = boundedWidth
      height = boundedHeight

      meta = metaDataGenerator(width, height);

      // create new movedCircles array
      movedCircles.length = 0;
      subgroupRadius = width > 760 ? (2 / 1300) * width : 0.8;
      padding = subgroupRadius * 0.81;
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

      let totalVerticalHeightArray = []
      movedCircles.forEach((dataset) => {
        let xExtent = d3.extent(dataset, (d) => d.x);
        let diameter = Math.abs((xExtent[1] - xExtent[0]));
        // console.log(xExtent)
        totalVerticalHeightArray.push(diameter)
        dataset.dataset = dataset;
      });
      let totalHeight = d3.sum(totalVerticalHeightArray)

      let gap = 60
      if (width < 760) {
        // 50px gap between five clusters
        d3.select("#" + triggerElementId).style('height', gap * 4 + totalHeight + 'px')
        height = gap * 4 + totalHeight
      } else {
        d3.select("#" + triggerElementId).style('height', '100%')
      }
      canvas.width = width * scale;
      canvas.height = height * scale;


      // Scale the CSS size of the canvas back down to fit its parent container.
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      let context = canvas.getContext("2d");
      context.scale(scale, scale);
      context.translate(width / 2, height / 2);
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
                  return `translate(${x}, ${y})`;
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
                return `translate(${textWidth * 0.5 - 20}, ${-textHeight / 2})`;
              } else {
                const x = textWidth / 8;
                const y = -textHeight / 2;
                return `translate(${x}, ${y})`;
              }
            },
          },
        });
      });
      // ScrollTrigger.create({
      //   trigger: "#" + triggerElementId,
      //   start: "top bottom",
      //   onEnter: ({ progress }) => {
      //     tl.play();
      //   },
      //   onEnterback: ({ progress }) => { }
      // });

      tl.play();
    }

  }

  function drawCircles(context, width, height) {
    context.clearRect(-width / 2, -height / 2, width, height);
    movedCircles.forEach(({ dataset }) => {
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
