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
  .style("position", "absolute")
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

svg
  .selectAll("text")
  .data(meta)
  .join("text")
  .attr("id", "dailyIngestionFunFactBubbles_text")

  .text((d) => d.group);
function resizeCanvas() {
  const { boundedWidth: width, boundedHeight: height } =
    chartDimensions(chartContainerId);
  canvas.width = width;
  canvas.height = height;
  let context = canvas.getContext("2d");
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
    tl.fromTo(
      "#dailyIngestionFunFactBubbles_text",
      { opacity: 1, attr: { x: width / 2, y: height / 2 } },
      {
        opacity: 1,
        duration: 1,
        attr: {
          x: (index) => meta[index].targetXY.x + width / 2,
          y: (index) => meta[index].targetXY.y + height / 2,
        },
      },
      "0"
    );
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
  movedCircles.forEach((dataset) => {
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