import { Circlepacking } from "../../components/CirclePacking.js";
import { chartDimensions } from "../chartDimensions.js";
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

    /***********************
     *3. Scale
     ************************/
    const rScale = d3
        .scaleSqrt()
        .domain(d3.extent(data, (d) => d.FOLLOWERS_23))
        .range([20, width / 8]);

    const circlePackingData = [];

    // let uniquePlatform = [...new Set(data.map((d) => d.PLATFORM))];
    let uniquePlatform = ["Youtube", "Instagram", "Tiktok"];
    uniquePlatform.forEach((plat) => {
        let processedData = d3.packSiblings(
            data
                .filter((d) => d.PLATFORM == plat)
                .sort((a, b) => d3.descending(a.FOLLOWERS_23, b.FOLLOWERS_23))
                .map((d) => ({
                    r: rScale(d.FOLLOWERS_23),
                    PLATFORM: d.PLATFORM,
                    ARTIST_NAME: d.ARTIST_NAME,
                }))
        );
        processedData.forEach((d) => (d.angle = Math.atan2(d.y, d.x)));
        circlePackingData.push({
            PLATFORM: plat,
            circlepackingData: processedData,
        });
    });

    const charts = d3
        .selectAll(".topArtistsByFollowersBubbles_bot-chart")
        .data(circlePackingData);

    const svg = charts
        .append("svg")
        .attr("width", width) // Ensure these are valid, non-zero values
        .attr("height", height);

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
    d3.selectAll("circle")
        .on("mousemove mouseenter mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(300)
                .attr("fill", "yourNewColor"); // Replace 'yourNewColor' with the desired color
        })
        .on("mouseout", (event, d) => {
            d3.select(event.currentTarget)
                .transition()
                .duration(300)
                .attr("fill", "none"); // Transition back to the original color
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
draw();
