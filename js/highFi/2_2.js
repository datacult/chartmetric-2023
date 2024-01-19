import { chartDimensions } from "../chartDimensions.js";
import { Treemap } from "../../components/Treemap.js";
async function drawChart(genreType,year) {
    // parameters
    let dataUrl = "https://share.chartmetric.com/year-end-report/2023/viz_2_2_en.csv";
    let chartContainerId = "gentreTreemap_chart";
    d3.select("#" + chartContainerId)
        .select("svg")
        .remove();
    /***********************
     *1. Access data
     ************************/

    let dataset = await d3.csv(dataUrl);

    let data = dataset.map((d) => Object.assign({}, d));
   
    data = data
        .filter((d) =>  d.TITLE == genreType)
        .filter((d) => year === "top_genres_for_artists_created_in_2023" ? d.NAME === year : true)
        .sort((a, b) => d3.descending(+a.VALUE, +b.VALUE))
        .map((d, i) => {
            return {
                GENRE_NAME: d.GENRE_NAME,
                VALUE: +d.VALUE,
                RANK: i + 1,
            };
        });
       
    /***********************
     *2. Create chart dimensions
     ************************/

    const { boundedWidth, boundedHeight } = chartDimensions(chartContainerId);
    const { boundedWidth: width, boundedHeight: height } = chartDimensions(
        chartContainerId,
        {
            top: boundedHeight * 0.02,
            right: boundedWidth * 0.02,
            bottom: boundedHeight * 0.02,
            left: boundedWidth * 0.02,
        }
    );
    console.log(width, height);
    /***********************
     *3. Set up canvas
     ************************/
    const visElement = document.getElementById(chartContainerId);
    const wrapper = d3
        .select(visElement)
        .append("svg")
        .attr("width", width)
        .attr("height", height * 0.98);
    // .attr("viewBox", `0 0 ${width*0.98} ${height*0.98}`)
    // .attr("preserveAspectRatio", "xMidYMid meet");

    Treemap(wrapper, data, {
        path: (d) => d.GENRE_NAME,
        value: (d) => d.VALUE,
        label: (d) => {
            return [d.RANK, d.GENRE_NAME].join(" | ");
        },
        // title: (d, n) => `${d.name}\n${n.value.toLocaleString("en")}`, // text to show on hover
        stroke: "none",
        paddingInner: "16",

        tile: d3.treemapSquarify,
        width: width,
        height: height,
    });
}

function setupResizeListener() {
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawChart();
        }, 50); // Adjust the timeout to your preference
    });
}
export async function init(genreType,year) {
    // await loadData();
    await drawChart(genreType,year);
    setupResizeListener();
}


