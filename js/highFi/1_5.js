import { createRoundGradient } from "../../components/backgroundGradientGenerator.js";
import { trimNames, setupResizeListener, chartDimensions } from "../utility.js";

// Function to create a round gradient

export function circlepacking_1_5(realData, selector, type = "All Time") {
    selector = "#" + selector;
    /***********************
     *1. Access data
     ************************/
    let chartSectionId = "topArtistsByFollowersBubbles_bot-section1";

    realData.forEach((entry) => {
        if (entry.PLATFORM) {
            entry.Combined = `${entry.PLATFORM}/${entry.ARTIST_NAME}`;
        }
    });



    /***********************
     *2. Create chart dimensions
     ************************/

    const { boundedWidth: width, boundedHeight: height } =
        chartDimensions(selector);
    d3.select(selector).html(`   <div id="topArtistsByFollowersBubbles_bottom">
      <div class="topArtistsByFollowersBubbles_bot-section" id="topArtistsByFollowersBubbles_bot-section1">
        <div class="topArtistsByFollowersBubbles_bot-chart Youtube" id="topArtistsByFollowersBubbles_bot-chart"></div>
        <div class="topArtistsByFollowersBubbles_bot-icon"></div>
      </div>
      <div class="topArtistsByFollowersBubbles_bot-section">
        <div class="topArtistsByFollowersBubbles_bot-chart Instagram"></div>
        <div class="topArtistsByFollowersBubbles_bot-icon"></div>
      </div>
      <div class="topArtistsByFollowersBubbles_bot-section">
        <div class="topArtistsByFollowersBubbles_bot-chart Tiktok"></div>
        <div class="topArtistsByFollowersBubbles_bot-icon"></div>
      </div>
    </div>`);
    function draw(data = realData, type = type) {
         data = realData.filter((d) => d.TYPE == type);
        const {
            boundedWidth: chartSectionWidth,
            boundedHeight: chartSectionHeight,
        } = chartDimensions(chartSectionId);
        console.log(data);
        /***********************
         *3. Scale
         ************************/
        let groupedTotal = d3.rollup(
            data,
            (v) => d3.sum(v, (d) => +d.FOLLOWERS),
            (d) => d.PLATFORM
        );
        let maxGroupValue = d3.max(Array.from(groupedTotal.values()));
        const rScale = d3
            .scaleSqrt()
            .domain([0, maxGroupValue])
            // controls the size of the circles
            .range([0, chartSectionWidth]);

        const circlePackingData = [];

        // let uniquePlatform = [...new Set(data.map((d) => d.PLATFORM))];
        let uniquePlatform = ["Youtube", "Instagram", "Tiktok"];
        uniquePlatform.forEach((plat) => {
            console.log();
            let processedData = d3.packSiblings(
                data
                    .filter((d) => d.PLATFORM == plat)
                    .sort((a, b) => d3.descending(a.FOLLOWERS, b.FOLLOWERS))
                    .map((d) => {
                        return {
                            r: rScale(+d.FOLLOWERS),
                            PLATFORM: d.PLATFORM,
                            ARTIST_NAME: d.ARTIST_NAME,
                            FOLLOWERS: d.FOLLOWERS,
                            IMAGE_URL: d.IMAGE_URL,
                        };
                    })
            );
            processedData.forEach((d) => (d.angle = Math.atan2(d.y, d.x)));
            circlePackingData.push({
                PLATFORM: plat,
                circlepackingData: processedData,
            });
        });

        let platforms = ["Tiktok", "Instagram", "Youtube"];

        const colorScale = d3.scaleOrdinal(platforms, [
            "#99D8DB",
            "#72A8DF",
            "#E2B5FD",
        ]);
        const charts = d3
            .selectAll(".topArtistsByFollowersBubbles_bot-chart")
            .data(circlePackingData);

        charts.each(function (d, i) {
            // Call the function with the container selector, width, height, and the central gradient color
            createRoundGradient(
                ".topArtistsByFollowersBubbles_bot-chart." + d.PLATFORM,
                width,
                height,
                rScale(groupedTotal.get(d.PLATFORM)),
                colorScale(d.PLATFORM),
                "#F5F4F0",
                d.PLATFORM
            );
        });

        // foreground circles

        const svg = charts
            .append("svg")
            .attr("width", width) // Ensure these are valid, non-zero values
            .attr("height", height)
            .attr("id", "bubble-foreground")
            .style("pointer-events", "none");
        // artist images
        const defs = d3
            .selectAll("#bubble-foreground")
            .append("defs")
            .attr("id", (d, i) => `defs-${uniquePlatform[i]}`);

        circlePackingData.forEach((platform, i) => {
            d3.select("defs#defs-" + platform.PLATFORM)
                .selectAll("pattern")
                .data(platform.circlepackingData)
                .enter()
                .append("pattern")
                .attr("id", (d) => {
                    return trimNames(d.ARTIST_NAME);
                }) // Unique ID for each pattern
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("patternContentUnits", "objectBoundingBox")
                .append("image")
                .attr("xlink:href", (d) => {
                    // console.log(d)
                    return d.IMAGE_URL;
                }) // URL of the image
                .attr("width", 1)
                .attr("height", 1)
                .attr("preserveAspectRatio", "xMidYMid meet");
        });
        const groups = svg
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const circlesSelection = groups
            .selectAll("circle")
            .data((d) => d.circlepackingData);

        //background circle: the normally toned ones
        circlesSelection
            .join("circle")
            .style("pointer-events", "all")
            .attr("id", (d) => d.PLATFORM + d.ARTIST_NAME)
            .attr("stroke", (d) => "lightgrey")
            .attr("stroke-width", (d) => 3)
            .attr("fill", (d, i) => colorScale(d.PLATFORM))
            .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 160))
            .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 160))
            .attr("r", (d) => d.r - 0.25)
            .transition()
            .ease(d3.easeCubicOut)
            .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
            .duration(1000)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);

        // The front circles: the dyed ones
        circlesSelection
            .join("circle")
            .style("pointer-events", "all")
            .attr("class", "circle-1-5")
            .attr("stroke", (d) => "white")
            .attr("stroke-width", (d) => 3)
            .attr("fill", (d, i) => `url(#${trimNames(d.ARTIST_NAME)})`)
            .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 160))
            .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 160))
            .attr("r", (d) => d.r - 0.25)
            .transition()
            .ease(d3.easeCubicOut)
            .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
            .duration(1000)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .style("mix-blend-mode", "luminosity"); //! blending mode doesnt work across svg containers
        // Correcting the event handling
        d3.selectAll(".circle-1-5")
            .on("mouseover", function (event, d) {
                d3.select(`[id="${d.PLATFORM + d.ARTIST_NAME}"]`).attr("fill", "none");

                const [xCoord, yCoord] = d3.pointer(event);
                let x = xCoord + width / 2;
                let y = yCoord + height / 2;
                d3
                    .select(".topArtistsByFollowersBubbles_bot-chart." + d.PLATFORM)
                    .append("div")
                    .attr("id", "tooltip_1_5")
                    .style("display", "block")
                    .style("left", x + 10 + "px")
                    .style("top", y + 10 + "px").html(`
                <div class="topline">
          <div class="state">${d.ARTIST_NAME}</div>
          <div class="billHR">${d.PLATFORM}</div>
          <div class="billText">
              ⮕ <strong>Followers:</strong> ${d.FOLLOWERS}
          </div>
          </div>
    `);
                gsap.to("#tooltip_1_5", { duration: 0.3, scale: 1, ease: "circ.out" });
            })
            .on("mouseleave", function (event, d) {
                d3.select(`[id="${d.PLATFORM + d.ARTIST_NAME}"]`).attr("fill", (d0) =>
                    colorScale(d0.PLATFORM)
                ); // Transition back to the original color

                d3.select("#tooltip_1_5").remove();
            });

        const icons = d3
            .selectAll(".topArtistsByFollowersBubbles_bot-icon")
            .data(circlePackingData)
            .join("div");
        icons
            .append("div")
            .attr("class", "text")
            .text((d) => d.PLATFORM);
        icons.append("div").attr("class", "icon").text("icon");
    }
    function update(data = realData, type = type) {
        // await loadData();

        // setupResizeListener(draw, data, type);

        draw(data, type);
    }

    update(realData, type);
    return {
        update: update,
    };
}
