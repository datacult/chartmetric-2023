import { chartDimensions } from "../chartDimensions.js";
export async function draw() {
    let countryUrl = "./data/viz2-1_country.csv";
    let genderUrl = "./data/viz2-1_gender.csv";

    let chartContainerId = "top100ArtistCountriesGenderCirclePacking_chart";

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

    /***********************
     *2. Create chart dimensions
     ************************/

    const { boundedWidth: width, boundedHeight: height } = chartDimensions(
        chartContainerId,
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

        let padding = 3;
        let fill ='transparent'; // fill for leaf circles
        let fillOpacity = 0.9; // fill opacity for leaf circles
        let stroke = "white";
        let strokeWidth = .71; // stroke width for internal circles
        let strokeOpacity = .71;

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
        nodes
            .enter()
            .append("circle")
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

        // Update selection: Update existing circles
        nodes
            .transition()
            .duration(1000)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", (d) => d.r);

        // Exit selection: Circles that are removed
        nodes.exit().transition().duration(1000).attr("r", 0).remove();
    }
    const svg = d3
        .select("#" + chartContainerId)
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle");

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
        isMouseHovering&& artistNameKey
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
svg.on("mouseenter", () => {
    isMouseHovering = true;
    updateOnMouseEnter();
}).on("mouseleave", () => {
    isMouseHovering = false;
    updateOnMouseLeave();
});

// ScrollTrigger setup with onLeaveBack callback
ScrollTrigger.create({
    markers: true,
    trigger: "#gender-section",
    start: "center center",
    onEnter: ({ progress }) => {
        genderSection = progress > 0;
        updateOnMouseEnter();
    },
    onLeaveBack: () => {
        genderSection = false;
        updateOnMouseLeave(); // Update using country data, considering hover state
    }
});
}
draw();
