import { chartDimensions } from "../chartDimensions.js";
import { Treemap } from "../../components/Treemap.js";
async function draw() {
    // parameters
    let dataUrl = "./data/genreTreemap.csv";
    let chartContainerId = "gentreTreemap_chart";

    /***********************
     *1. Access data
     ************************/

    let dataset = await d3.csv(dataUrl);

    let data = dataset.map((d) => Object.assign({}, d));

    console.log(data);
    data = data
        .filter((d) => d.NAME == "top_genres_for_tracks_all_time")
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

    const { boundedWidth: width, boundedHeight: height } = chartDimensions(
        chartContainerId,
        { bottom: 30, right: 30 }
    );
    /***********************
     *3. Set up canvas
     ************************/
    const visElement = document.getElementById(chartContainerId);
    const wrapper = d3
        .select(visElement)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    Treemap(wrapper, data, {
        path: (d) => d.GENRE_NAME,
        value: (d) => d.VALUE,
        label: (d) => {
            return [d.RANK, d.GENRE_NAME].join(" | ");
        },
        // title: (d, n) => `${d.name}\n${n.value.toLocaleString("en")}`, // text to show on hover
        stroke: "none",
        paddingInner: "10",
       
        tile: d3.treemapSquarify,
        width: width,
        height: height,
    });

    /***********************
     *4. Create scales
     ************************/

    /***********************
     *5. Draw canvas
     ************************/
}

draw();
