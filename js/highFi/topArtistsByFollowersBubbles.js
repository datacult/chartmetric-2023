import { Circlepacking } from "../../components/CirclePacking.js";
import { chartDimensions } from "../chartDimensions.js";

let chartSectionId = "topArtistsByFollowersBubbles_bot-section1";
// Function to create a round gradient
function createRoundGradient(
    selector,
    width,height,radius,
    innerColor,
    outerColor,
    gradientId
) {
   

    // Create the SVG container
    let svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("fill", "none")
        .attr('id', 'gradient-background')
        .style('position', 'absolute')
    // Define a radial gradient
    let defs = svg.append("defs");
    let radialGradient = defs.append("radialGradient").attr("id", gradientId);

    // Define the color stops of the gradient
    radialGradient
        .append("stop")
        .attr("offset", "90%")
        .attr("stop-color", innerColor);

    radialGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", outerColor);

    // Append the circle and fill it with the gradient
    svg
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", radius*1.5)
        .attr("fill", `url(#${gradientId})`);

    // Append defs and filter for the Gaussian blur to the whole SVG to get the soft edge effect
    let filter = defs
        .append("filter")

        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")
        .attr("id", `${gradientId}-glow`);
    filter
        .append("feGaussianBlur")
        .attr("stdDeviation", 50)
        .attr("result", "coloredBlur");

    // Apply the filter to the SVG container
    svg.style("filter", `url(#${gradientId}-glow)`);
}

async function draw() {
    let dataUrl = "./data/topArtistsByFollowers.csv";
    let chartContainerId = "topArtistsByFollowersBubbles_bot-chart";
    /***********************
     *1. Access data
     ************************/

    let data = await d3.csv(dataUrl);

    data.forEach((entry) => {
        entry.Combined = `${entry.PLATFORM}/${entry.ARTIST_NAME}`;
        entry.FOLLOWERS_23 = +entry.FOLLOWERS_23;
    });
    /***********************
     *2. Create chart dimensions
     ************************/
    const { boundedWidth: width, boundedHeight: height } =
        chartDimensions(chartContainerId);
    const { boundedWidth: chartSectionWidth, boundedHeight: chartSectionHeight } =
        chartDimensions(chartSectionId);
    /***********************
     *3. Scale
     ************************/
    let groupedTotal = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => +d.FOLLOWERS_23),
        (d) => d.PLATFORM
    );
    let maxGroupValue = d3.max(groupedTotal.values());
    const rScale = d3
        .scaleSqrt()
        .domain([0, maxGroupValue])
        // controls the size of the circles
        .range([0, chartSectionWidth / 3]);
    console.log(chartSectionWidth);
    const circlePackingData = [];

    // let uniquePlatform = [...new Set(data.map((d) => d.PLATFORM))];
    let uniquePlatform = ["Youtube", "Instagram", "Tiktok"];
    uniquePlatform.forEach((plat) => {
        let processedData = d3.packSiblings(
            data
                .filter((d) => d.PLATFORM == plat)
                .sort((a, b) => d3.descending(a.FOLLOWERS_23, b.FOLLOWERS_23))
                .map((d)  => {
                    console.log(
                        "each circle radius " + Math.round(rScale(d.FOLLOWERS_23))
                    );
                    return {
                        r: rScale(d.FOLLOWERS_23),
                        PLATFORM: d.PLATFORM,
                        ARTIST_NAME: d.ARTIST_NAME,
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
            width,height,
            rScale(groupedTotal.get(d.PLATFORM)),
            colorScale(d.PLATFORM),
            "#F5F4F0",
            d.PLATFORM
        );
    });

    const svg = charts
        .append("svg")
        .attr("width", width) // Ensure these are valid, non-zero values
        .attr("height", height).attr('id', 'bubble-foreground')
    const groups = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
    const chart = groups
        .selectAll("circle")
        .data((d) => d.circlepackingData)
        .join("circle")
        .attr("stroke", (d) => "white")
        .attr("stroke-width", (d) => 3)
        .attr("fill", (d) => "none")
        .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 60))
        .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 60))
        .attr("r", (d) => d.r - 0.25)
        .transition()
        .ease(d3.easeCubicOut)
        .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
        .duration(1000)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    // Correcting the event handling
    // d3.selectAll("circle")
    //     .on("mousemove mouseenter mouseover", (event, d) => {
    //         d3.select(event.currentTarget)
    //             .transition()
    //             .duration(300)
    //             .attr("fill", "yourNewColor"); // Replace 'yourNewColor' with the desired color
    //     })
    //     .on("mouseout", (event, d) => {
    //         d3.select(event.currentTarget)
    //             .transition()
    //             .duration(300)
    //             .attr("fill", "none"); // Transition back to the original color
    //     });
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
draw();
