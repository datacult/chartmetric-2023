import { Circlepacking } from "../../components/CirclePacking.js";
import { chartDimensions } from "../chartDimensions.js";

let chartSectionId = "topArtistsByFollowersBubbles_bot-section1";
// Function to create a round gradient
function createRoundGradient(
    selector,
    width,
    height,
    radius,
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
        .attr("id", "gradient-background")
        .style("position", "absolute");
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
        .attr("r", radius * 1.5)
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

export async function draw1_5(type="All Time") {
    
    let chartContainerId = "topArtistsByFollowersBubbles_bot-chart";
    /***********************
     *1. Access data
     ************************/

    
    let realData = await d3.csv("https://share.chartmetric.com/year-end-report/2023/viz_1_5_en.csv",d3.autoType);

    realData.forEach((entry) => {
        entry.Combined = `${entry.PLATFORM}/${entry.ARTIST_NAME}`;
        entry.FOLLOWERS_23 = +entry.FOLLOWERS;
    });
    console.log(realData)
    let data = realData.filter((d) => d.TYPE == type);
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
    
    const circlePackingData = [];

    // let uniquePlatform = [...new Set(data.map((d) => d.PLATFORM))];
    let uniquePlatform = ["Youtube", "Instagram", "Tiktok"];
    uniquePlatform.forEach((plat) => {
        let processedData = d3.packSiblings(
            data
                .filter((d) => d.PLATFORM == plat)
                .sort((a, b) => d3.descending(a.FOLLOWERS_23, b.FOLLOWERS_23))
                .map((d) => {
                   
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
    const defs = d3.selectAll("svg").append("defs");
  
    // circlePackingData.forEach((d, i) => {
    defs
        .append("pattern")
        .attr("id", "image-fill-") // Unique ID for each pattern
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr(
            "xlink:href",
            "https://share.chartmetric.com/artists/299/172/11172299/11172299-profile.webp"
        ) // URL of the image
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "xMidYMid slice");
    // });
    const groups = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const circlesSelection = groups
        .selectAll("circle")
        .data((d) => d.circlepackingData);
    circlesSelection
        .join("circle")
        .style("pointer-events", "all")
        .attr("id", d=>d.PLATFORM+d.ARTIST_NAME)
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
        .attr("cy", (d) => d.y)
        .style("mix-blend-mode", "luminosity");
    circlesSelection
        .join("circle")
        .style("pointer-events", "all")
        .attr("class", "circle-1-5")
        .attr("stroke", (d) => "white")
        .attr("stroke-width", (d) => 3)
        .attr("fill", (d, i) => `url(#image-fill-)`)
        .attr("cx", (d) => Math.cos(d.angle) * (width / Math.SQRT2 + 160))
        .attr("cy", (d) => Math.sin(d.angle) * (width / Math.SQRT2 + 160))
        .attr("r", (d) => d.r - 0.25)
        .transition()
        .ease(d3.easeCubicOut)
        .delay((d) => Math.sqrt(d.x * d.x + d.y * d.y) * 4)
        .duration(1000)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .style("mix-blend-mode", "luminosity");
    // Correcting the event handling
    d3.selectAll(".circle-1-5")
        .on("mouseenter", function (event, d) {
           
            d3.select(`[id="${d.PLATFORM+d.ARTIST_NAME}"]`)
                .attr("fill", "none"); // Replace 'yourNewColor' with the desired color
        })
        .on(" mouseleave", function (event, d) {
            d3.select(`[id="${d.PLATFORM+d.ARTIST_NAME}"]`)
                .attr("fill", d0=> colorScale(d0.PLATFORM)); // Transition back to the original color
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

