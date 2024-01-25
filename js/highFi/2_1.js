import { chartDimensions, debounce, trimNames } from "../utility.js";
export function circlepacking_2_1(
  realData,
  selector = "top100ArtistCountriesGenderCirclePacking_chart"
) {
  // let selector = "top100ArtistCountriesGenderCirclePacking_chart";

  let sizeKey = "PEAK_CM_SCORE";
  let genderKey = "PRONOUN";
  let countryKey = "COUNTRY_NAME";
  let artistNameKey = "ARTIST_NAME";

  /***********************
   *1. Access data
   ************************/
  const country = realData.filter((d) => d.COUNTRY_NAME !== "Global");
  const gender = realData.filter((d) => d.COUNTRY_NAME !== "Global");

  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth: width, boundedHeight: height } = chartDimensions(
    selector,
    { bottom: 0, right: 0 }
  );
  //
  /***********************
   *3. Set up canvas
   ************************/
  const wrapper = d3.select("#" + selector);

  wrapper
    .append("div")
    .attr("id", "top100ArtistCountriesGenderCirclePacking_background");

  // Append the chart container div
  const svg = wrapper
    .append("div")
    .attr("id", "top100ArtistCountriesGenderCirclePacking_chartContainer")
    .append("svg")
    .attr("id", "top100ArtistCountriesGenderCirclePacking_chart");

  svg
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%")
    .attr("font-size", 10)
    .attr("text-anchor", "middle");
  const defs = svg.append("defs");

  defs
    .selectAll("pattern")
    .data(realData)
    .join("pattern")
    .attr("id", (d, i) => {
      return "image-fill-" + trimNames(d[artistNameKey]);
    }) // Unique ID for each pattern
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr("xlink:href", (d) => d.IMAGE_URL) // URL of the image
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMidYMid slice");
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
  function updateVisualization(data, valueAccessor, svg, hovering) {
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
    svg.selectAll(".leaf-text").remove();

    // Render leaf node texts only when isMouseHovering is false

    const leafNodes = svg
      .selectAll(".leaf")
      .data(root.descendants().filter((d) => !d.children))
      .enter()
      .append("text")
      .attr("class", "leaf-text")
      .attr("id", (d) => {
        if (d.data[0]) {
          return trimNames(d.data[0]);
        }
   
      })
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("font-size", (d) => Math.min(8, d.r) + "px")
      .style("font-weight", "bold")
      .style("fill", "#1c1c1c")
      .text((d) => {
        if (d.data[0]) {
          return d.data[0];
        } else {
          // country

          return d.parent.data[0] + "\n" + d3.format("d")(d.data[1]);
        }
      });
    // }
    nodes
      .enter()
      .append("circle")
      .attr("class", "front")
      .attr("class", (d) => (d.children ? "" : "leave"))
      .attr("id", (d) => {
        const firstHalf = d.data[0] ? d.data[0] : "parent";
        return "front" + trimNames(firstHalf + d.data[1]);
      })
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
      .attr("r", (d) => d.r)
      .attr("id", (d) => {
        const firstHalf = d.data[0] ? d.data[0] : "parent";
        return "back" + trimNames(firstHalf + d.data[1]);
      })
      .attr("fill", (d, i) => {
        if (d.data[0]) {
          console.log();
          return "url(#image-fill-" + trimNames(d.data[0]) + ")";
        }
      })
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
    nodes.exit().remove();

    //  on hover
    const frontCircles = svg
      .selectAll(".leave")
      // .style("transform-origin", "50% 50%");
      .style("transform-origin", (d) => {
        return `${d.x}px ${d.y}px`;
      });

    let flippedCircles = new Map();
    const handleMouseEnter = function (event, frontData) {
      const hoveredBackId = frontData.data[0]
        ? "#back" + trimNames(frontData.data[0] + frontData.data[1])
        : "#back" + trimNames("parent" + frontData.data[1]);

      // get rid of text
      svg.selectAll(".leaf-text").each(function (d, i) {
        const id = d3.select(this).attr("id");
        if (hoveredBackId.includes(id)) {
          d3.select(this).attr("opacity", 0);
        }
      });
      // .remove();
      // flip
      svg.select(`${hoveredBackId}`).classed("flipped", true);
      flippedCircles.set(hoveredBackId, Date.now());
      // Animate the top circle to scale down
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 0)
        .style("transform", "scaleX(0)")
        .end()
        .then(() => {
          // Hide the top circle
          d3.select(this).style("display", "none");

          // Prepare the back circle for display

          svg
            .select(hoveredBackId)
            .style("display", "block")
            .style("opacity", 0)
            .style("transform", "scaleX(0)")
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("transform", "scaleX(1)")
            .attr("class", "flipped")
            .style("z-index", 1000);
        });
    };
    frontCircles.on("mouseenter", handleMouseEnter);
    let intervalId = null;

    // Function to start the interval
    function startInterval() {
      if (!intervalId) {
        intervalId = setInterval(checkFlippedCircles, 500); // Adjust interval as needed
      }
    }

    // Function to stop the interval
    function stopInterval() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    // Function to check flipped circles
    function checkFlippedCircles() {
      if (flippedCircles.size === 0) {
        stopInterval();
        return;
      }

      flippedCircles.forEach((timeFlipped, id) => {
        if (Date.now() - timeFlipped > 2000) {
          // 2 seconds elapsed
          const circle = svg.select(`${id}`);
          if (circle.empty() || circle.node().matches(":hover")) {
            return;
          }

          // Assuming handleMouseLeave primarily changes circle styles or attributes
          animateCircle(circle, id);
          circle.classed("flipped", false);
          flippedCircles.delete(id);
        }
      });
    }

    // Function to animate circles
    function animateCircle(circle, id) {
      circle
        .transition()
        .duration(300)
        .style("opacity", 0)
        .style("transform", "scaleX(0)")
        .end()
        .then(() => {
          circle.style("display", "none");

          const correspondingFrontId =
            "#front" + id.replace("back", "").replace("#", "");
          const frontCircle = svg.select(`${correspondingFrontId}`);
          if (!frontCircle.empty()) {
            frontCircle
              .style("display", "block")
              .style("opacity", 0)
              .style("transform", "scaleX(0)")
              .transition()
              .duration(300)
              .style("opacity", 1)
              .style("transform", "scaleX(1)");
          }
        });
    }

    // Example usage
    flippedCircles.set("someId", Date.now());
    startInterval(); // Call this when you start flipping circles

    const handleMouseLeave = function (event, backData) {
      // Animate the back circle to scale down
      const hoveredFrontId =
        "#front" + trimNames(backData.data[0] + backData.data[1]);
      const hoveredBackId =
        "back" + trimNames(backData.data[0] + backData.data[1]);
      flippedCircles.delete(hoveredBackId);

      //add text
      svg.selectAll(".leaf-text").each(function (d, i) {
        const id = d3.select(this).attr("id");
        if (hoveredBackId.includes(id)) {
          d3.select(this).attr("opacity", 1);
        }
      });

      d3.select(this)
        .transition()
        .duration(100)
        .style("opacity", 0)
        .style("transform", "scaleX(0)")
        .end()
        .then(() => {
          // Hide the back circle
          d3.select(this).style("display", "none");

          // Show and animate the top circle
          svg
            .select(hoveredFrontId)
            .style("display", "block")
            .style("opacity", 0)
            .style("transform", "scaleX(0)")
            .transition()
            .duration(100)
            .style("opacity", 1)
            .style("transform", "scaleX(1)");
        });
    };
    // Define the mouseout behavior for the back circle
    svg.selectAll(".back").on("mouseleave", handleMouseLeave);
  }
  // Flag to track mouse hover state
  let genderSection = false;
  let isMouseHovering = false;
  // Initial data processing
  const initialData = processData(country, sizeKey, countryKey);
  updateVisualization(initialData, v, svg, isMouseHovering);

  function updateOnMouseEnter(genderSection, hovering) {
    const dataToProcess = genderSection ? gender : country;
    const keyForGrouping = genderSection ? genderKey : countryKey;

    const updatedData = processData(
      dataToProcess,
      sizeKey,
      keyForGrouping,
      isMouseHovering && artistNameKey
    );
    updateVisualization(updatedData, v, svg, hovering);
  }

  function updateOnMouseLeave(genderSection, hovering) {
    const dataToProcess = genderSection ? gender : country;
    const keyForGrouping = genderSection ? genderKey : countryKey;

    const updatedData = processData(
      dataToProcess,
      sizeKey,
      keyForGrouping,
      isMouseHovering && !genderSection ? artistNameKey : null // Include artistNameKey based on hover state
    );
    updateVisualization(updatedData, v, svg, hovering);
  }

  // Update the mouse hover state
  svg
    .on("mouseenter", () => {
      isMouseHovering = true;
      updateOnMouseEnter(genderSection, isMouseHovering);
    })
    .on("mouseleave", () => {
      isMouseHovering = false;
      updateOnMouseLeave(genderSection, isMouseHovering);
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
  function update(data, genderSection, isMouseHovering) {
    //! genderSection is true: we are in gender section
    //! false: we are not, but in country section
    if (genderSection) {
      updateOnMouseEnter(genderSection, isMouseHovering);
    } else {
      updateOnMouseLeave(genderSection, isMouseHovering);
    }
  }
  update(realData, false, false);

  return {
    update: update,
  };
}
