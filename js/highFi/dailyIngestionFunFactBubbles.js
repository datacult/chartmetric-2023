import { chartDimensions } from "../chartDimensions.js";

const c = document.getElementById("dailyIngestionFunFactBubbles_Chart");
const context = c.getContext("2d");

const subgroupRadius = 2.5;
const padding = 0.61;
/***********************
 *2. Create chart dimensions
 ************************/
const { boundedWidth: width, boundedHeight: height } = chartDimensions(
  "dailyIngestionFunFactBubbles_Chart"
);
/***********************
 *1. Access data
 ************************/
const meta = [
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

const groups = meta.map((d) => d.group);
let movedCircles = [];

// scale
const colorScale = d3.scaleOrdinal(meta, [
  "#1B81F7",
  "#FC803B",
  "#FEC641",
  "#EC76F4",
]);
for (const group of groups) {
  // for (const [group, data] of Object.entries(circlesPerGroup)) {
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
}
const individualTextContainer = d3
  .select("#dailyIngestionFunFactBubbles_textContainer")
  .selectAll("#dailyIngestionFunFactBubbles_text")
  .data(meta)
  .join("div")
  .attr("id", "dailyIngestionFunFactBubbles_text");

const individualTextContainerIcon = individualTextContainer
  .append("div")
  .attr("class", "icon-container")
  .style("position", "relative")
  .style("width", "1.6rem")
  .style("height", "1.6rem");
// .style("transform", "translate(65%, 10%)")
// icon background
individualTextContainerIcon
  .append("div")
  .attr("class", "iconBackground")
  .style("background-color", (d) => "#EFF5FB");

// icon
individualTextContainerIcon
  .append("div")
  .attr("class", "icon")
  .text((d) => d.icon);
// text
individualTextContainer
  .append("div")
  .attr("class", "text")

  .text((d) => d.group);

// set up timeline
let tl = gsap.timeline({ paused: true });
// Add tweens for each group to animate the offsets simultaneously
meta.forEach((groupMeta) => {
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
});

function drawCircles(meta) {
  // Clear the previous frame
  context.clearRect(-width / 2, -height / 2, width, height);

  // Redraw all circles using the current offsetXY values
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
  // Draw the text labels
  // meta.forEach((groupMeta) => {
  //   context.font = "16px Arial"; // Adjust font size and type as needed

  //   context.fillStyle = "Black"; // Text color
  //   context.textAlign = "center";
  //   context.textBaseline = "middle";

  //   context.strokeStyle = "white";
  //   context.lineWidth = 8;
  //   context.strokeText(
  //     groupMeta.group,
  //     groupMeta.offsetXY.x,
  //     groupMeta.offsetXY.y
  //   );

  //   context.fillText(
  //     groupMeta.group,
  //     groupMeta.offsetXY.x,
  //     groupMeta.offsetXY.y
  //   );
  // });
}
context.translate(width / 2, height * 0.5);
drawCircles(meta);
gsap.utils.toArray("section").forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    markers: true,
    start: "top 50%",
    end: "+=320",
    scrub: true,
    onEnter: () => {
      tl.play();
    },
    onEnterBack: () => {
      tl.reverse();
    },
  });
});
