import { chartDimensions } from "../chartDimensions.js";
export async function circlepacking_2_1(realData, selector) {
  let countryUrl = "./data/viz2-1_country.csv";
  let genderUrl = "./data/viz2-1_gender.csv";

  let sizeKey = "CHARTMETRIC_SCORE";
  let genderKey = "PRONOUN";
  let countryKey = "COUNTRY_NAME";
  let artistNameKey = "ARTIST_NAME";

  /***********************
   *1. Access data
   ************************/
  const [country, gender] = await Promise.all([
    d3.csv(countryUrl, d3.autoType),
    d3.csv(genderUrl, d3.autoType),
  ]);

  const countryData = realData.filter((d) => d.COUNTRY_NAME !== "Global");

  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth: width, boundedHeight: height } = chartDimensions(
    selector,
    { bottom: 30, right: 30 }
  );
  //
  /***********************
   *3. Set up canvas
   ************************/
  // Data processing function
  function processData(data, valueKey, parentKey, artistKey) {
    return d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d[valueKey]),
      (d) => d[parentKey],
      artistKey ? (d) => d[artistKey] : (d) => null
    );
  }
  const v = ([, value]) => value;
  // Function to update visualization
  function updateVisualization(data, valueAccessor, svg) {
    const sort = (a, b) => d3.descending(a.value, b.value);
    const title = (d, n) =>
      `${n
        .ancestors()
        .reverse()
        .map(({ data: d }) => d.name)
        .join(".")}\n${n.value.toLocaleString("en")}`;
    let padding = 3;
    let fill = "transparent"; // fill for leaf circles
    let fillOpacity = 0.9; // fill opacity for leaf circles
    let stroke = "white";
    let strokeWidth = 0.71; // stroke width for internal circles
    let strokeOpacity = 0.71;

    let root = d3
      .hierarchy(data, undefined)
      .sum((d) => Math.max(0, v(d)))
      .sort(sort);

    d3.pack().size([width, height]).padding(padding)(root);
    const descendants = root.descendants();
    const leaves = descendants.filter((d) => !d.children);
    leaves.forEach((d, i) => (d.index = i));
    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);
    const nodes = svg
      .selectAll("circle")
      .data(root.descendants(), (d) => d.data.key);

    // Enter selection: New circles
    // front circles
    nodes
      .enter()
      .append("circle")
      .attr("class", "front")
      .attr("class", (d) => (d.children ? "" : 'leave'))
      // .style("transform-origin", "50% 50%")
      .style("transform-origin", (d) => {
        return `${d.x}px ${d.y}px`;
      })
      .style("transform", "scaleX(1)")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => (d.children ? "transparent" : fill))
      // .attr("fill-opacity", (d) => (d.children ? null : fillOpacity))
      .attr("stroke", (d) => stroke)
      .attr("stroke-width", (d) => (d.children ? strokeWidth : null))
      .attr("stroke-opacity", (d) => (d.children ? strokeOpacity : null))
      .attr("r", 0) // start with radius 0
      .transition()
      .duration(1000)
      .attr("r", (d) => d.r); // animate to actual radius

    // back circles
    nodes
      .enter()
      .append("circle")
      .attr("class", "back")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 50)

      .attr("fill", "url(#image-fill-)")
      .style("opacity", 0) // Initially hidden
      .style("transform-origin", (d) => {
        return `${d.x}px ${d.y}px`;
      })
      // .style("transform-origin", "50% 50%") // Set the transform origin
      .style("transform", "scaleX(0)");
    // Update selection: Update existing circles
    nodes
      .transition()
      .duration(1000)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r);

    // Exit selection: Circles that are removed
    nodes.exit().transition().duration(1000).attr("r", 0).remove();

    // const T = descendants.map((d) => title(d.data, d));
    // if (T) nodes.append("title").text((d, i) => T[i]);

    //  on hover
    const frontCircles = svg
      .selectAll(".leave")
      // .style("transform-origin", "50% 50%");
      .style("transform-origin", (d) => {
        return `${d.x}px ${d.y}px`;
      });
    frontCircles.on("mouseover", function () {
      // Animate the top circle to scale down
      d3.select(this)
        .transition()
        .duration(500)
        .attr("fill", "url(#image-fill-)")
    }).on("mouseout", function () {
      d3.select(this)
      .transition()
      .duration(500)
      .attr("fill", "transparent")
    })

    // Define the mouseout behavior for the back circle
    svg.selectAll(".back").on("mouseout", function () {
      // Animate the back circle to scale down
      d3.select(this)
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("transform", "scaleX(0)")
        .end()
        .then(() => {
          // Hide the back circle
          d3.select(this).style("display", "none");

          // Show and animate the top circle
          frontCircles
            .style("display", "block")
            .style("opacity", 0)
            .style("transform", "scaleX(0)")
            .transition()
            .duration(500)
            .style("opacity", 1)
            .style("transform", "scaleX(1)");
        });
    });
  }
  const svg = d3
    .select("#" + selector)
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "middle");
  svg
    .append("defs")
    .append("pattern")
    .attr("id", "image-fill-") // Unique ID for each pattern
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr(
      "xlink:href",
      "https://share.chartmetric.com/artists/299/172/11172299/11172299-profile.webp") // URL of the image
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMidYMid slice");

  // Initial data processing
  const initialData = processData(country, sizeKey, countryKey);
  updateVisualization(initialData, v, svg);

  let genderSection = false;
  let isMouseHovering = false; // Flag to track mouse hover state

  function updateOnMouseEnter() {
    const dataToProcess = genderSection ? gender : country;
    const keyForGrouping = genderSection ? genderKey : countryKey;

    const updatedData = processData(
      dataToProcess,
      sizeKey,
      keyForGrouping,
      isMouseHovering && artistNameKey
    );
    updateVisualization(updatedData, v, svg);
  }

  function updateOnMouseLeave() {
    const dataToProcess = genderSection ? gender : country;
    const keyForGrouping = genderSection ? genderKey : countryKey;

    const updatedData = processData(
      dataToProcess,
      sizeKey,
      keyForGrouping,
      isMouseHovering && !genderSection ? artistNameKey : null // Include artistNameKey based on hover state
    );
    updateVisualization(updatedData, v, svg);
  }

  // Update the mouse hover state
  svg
    .on("mouseenter", () => {
      isMouseHovering = true;
      updateOnMouseEnter();
    })
    .on("mouseleave", () => {
      isMouseHovering = false;
      updateOnMouseLeave();
    });

  // ScrollTrigger setup with onLeaveBack callback
  // ScrollTrigger.create({
  //   markers: true,
  //   trigger: "#gender-section",
  //   start: "center center",
  //   onEnter: ({ progress }) => {
  //     genderSection = progress > 0;
  //     updateOnMouseEnter();
  //   },
  //   onLeaveBack: () => {
  //     genderSection = false;
  //     updateOnMouseLeave(); // Update using country data, considering hover state
  //   },
  // });
}

