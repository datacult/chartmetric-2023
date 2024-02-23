// Copyright 2021-2023 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/treemap
export function trimNames(str) {
  return str
    .replace(/[^a-zA-Z0-9-_]/g, "") // Remove special characters
    .replace(/\s/g, "_") // Replace spaces with underscores
    .replace(/\(|\)/g, "");
}
export function TreemapComponent(
  data,
  {
    path,
    id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    value, // given a node d, returns a quantitative value (for area encoding; null for count)
    sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
    label, // given a leaf node d, returns the name to display on the rectangle
    group, // given a leaf node d, returns a categorical value (for color encoding)

    tile = d3.treemapBinary, // treemap strategy
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    margin = 0, // shorthand for margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    padding = 0, // shorthand for inner and outer padding
    paddingInner = padding, // to separate a node from its adjacent siblings
    paddingOuter = padding, // shorthand for top, right, bottom, and left padding
    paddingTop = paddingOuter, // to separate a node’s top edge from its children
    paddingRight = paddingOuter, // to separate a node’s right edge from its children
    paddingBottom = paddingOuter, // to separate a node’s bottom edge from its children
    paddingLeft = paddingOuter, // to separate a node’s left edge from its children
    round = true, // whether to round to exact pixels

    zDomain, // array of values for the color scale
  } = {}
) {
  const stratify = (data) =>
    d3
      .stratify()
      .path(path)(data)
      .each((node) => {
        if (node.children?.length && node.data != null) {
          const child = new d3.Node(node.data);
          node.data = null;
          child.depth = node.depth + 1;
          child.height = 0;
          child.parent = node;
          child.id = node.id + "/";
          node.children.unshift(child);
        }
      });
  const root =
    path != null
      ? stratify(data)
      : id != null || parentId != null
      ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

  // Compute the values of internal nodes by aggregating from the leaves.
  value == null
    ? root.count()
    : root.sum((d) => Math.max(0, d ? value(d) : null));

  // Prior to sorting, if a group channel is specified, construct an ordinal color scale.

  const G = group == null ? null : leaves.map((d) => group(d.data, d));
  if (zDomain === undefined) zDomain = G;
  zDomain = new d3.InternSet(zDomain);

  // Compute labels and titles.

  // Sort the leaves (typically by descending value for a pleasing layout).
  if (sort != null) root.sort(sort);

  // Compute the treemap layout.
  d3
    .treemap()
    .tile(tile)
    .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
    .paddingInner(paddingInner)
    .paddingTop(paddingTop)
    .paddingRight(paddingRight)
    .paddingBottom(paddingBottom)
    .paddingLeft(paddingLeft)
    .round(round)(root);

  const leaves = root.leaves();

  const nodes = d3
    .select("#gentreTreemap_chart")
    .selectAll("div")
    .data(leaves, (d) => {
   
      return trimNames(d.data.GENRE_NAME + d.data.TIMEFRAME + d.data.RANK);
    })
    .join(
      (enter) => {
        const divEnter = enter
          .append("div")
          .attr("class", "front-2-2-rect")
          .attr("id", (d, i) => d.id + "-front")
          .style("position", "absolute")
          .style("left", (d) => d.x0 + "px")
          .style("top", (d) => d.y0 + "px")
          .style("width", (d) => d.x1 - d.x0 + "px")
          .style("height", (d) => d.y1 - d.y0 + "px")
          .style("background-image", (d) => `url(${d.data.IMAGE_URL})`);

        gsap.fromTo(
          divEnter.nodes(),
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "back.out(1.7)",
            stagger: {
              // wrap advanced options in an object
              each: 0.05,
              from: "center",
              grid: "auto",
              ease: "power2.inOut",
            },
          }
        );
        return divEnter;
      },

      (update) =>
        update
          .transition()
          .duration(1000)
          .style("left", (d) => d.x0 + "px")
          .style("top", (d) => d.y0 + "px")
          .style("width", (d) => d.x1 - d.x0 + "px")
          .style("height", (d) => d.y1 - d.y0 + "px"),
      (exit) =>
        gsap.to(exit.nodes(), {
          opacity: 0,
          scale: 0,
          duration: 1,
          ease: "power2.out",
          onComplete: () => exit.remove(),
        })
    );

  nodes
    .append("div")
    .attr("class", "label-bg")

    .text((d) => label(d.data));
}
