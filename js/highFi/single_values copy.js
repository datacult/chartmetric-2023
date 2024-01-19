import { chartDimensions } from "../chartDimensions.js";
const metaDataGenerator = (width, height) => [
  {
    group: "Chartmetric daily artists ingested",
    size: 3670,
    offsetXY: { x: 0, y: 0 },
    targetXY: { x: -width * 0.05, y: height * 0.1 },
    icon: "🎵",
  },
  {
    group: "NFL players",
    size: 1696,
    offsetXY: { x: 0, y: 0 },
    targetXY: { x: width * 0.34, y: height * 0.2 },
    icon: "🏈",
  },
  {
    group: "MLB players",
    size: 975,
    offsetXY: { x: 0, y: 0 },
    targetXY: { x: -width * 0.34, y: -height * 0.2 },
    icon: "⚾",
  },
  {
    group: "NBA players",
    size: 540,
    offsetXY: { x: 0, y: 0 },
    targetXY: { x: width * 0.17, y: -height * 0.28 },
    icon: "🏀",
  },
];
const chartId = "dailyIngestionFunFactBubbles_Chart";
const chartContainerId = "dailyIngestionFunFactBubbles_ChartContainer";
let subgroupRadius = 2.5;
const padding = 0.61;

const container = document.querySelector("#" + chartContainerId);
const canvas = document.createElement("canvas");
canvas.setAttribute("id", chartId);
container.appendChild(canvas);

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

function resizeCanvas() {
  const { boundedWidth: width, boundedHeight: height } = chartDimensions(chartContainerId);
  canvas.width = width;
  canvas.height = height;
  let context = canvas.getContext("2d");
  meta = metaDataGenerator(width, height);
  
  context.translate(width / 2, height * 0.5);
  populateMovedCircles();
  drawCircles(context);

  let tl = gsap.timeline({ paused: true });
  meta.forEach((groupMeta, index) => {
    animateGroup(groupMeta, tl, meta,width,height);
  });
  tl.play();
}

function animateGroup(groupMeta, tl, metawidth,height) {
  tl.to(
    groupMeta.offsetXY,
    {
      x: groupMeta.targetXY.x,
      y: groupMeta.targetXY.y,
      duration: 2,
      stagger: 0.1,
      // ease: "bounce.out",
      // Use a common onUpdate callback for all tweens
      onUpdate: () => drawCircles(meta),
    },
    0
  );
  tl.fromTo(
    "#dailyIngestionFunFactBubbles_text",
    { opacity: 0, left: width / 2, top: height / 2 },
    {
      opacity: 1,
      duration: 2,
      left: (index) => meta[index].targetXY.x + width / 2,
      top: (index) => meta[index].targetXY.y + height / 2,
    },
    "0"
  );
}
function populateMovedCircles() {
  movedCircles.length = 0;
  groups.forEach(group => {
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
}
function drawCircles(context) {
  context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
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
