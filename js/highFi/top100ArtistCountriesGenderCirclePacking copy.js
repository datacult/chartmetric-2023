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
    // data processing
    let countryGroup = d3.rollup(
        country,
        (v) => d3.sum(v, (d) => d[sizeKey]),
        (d) => d[countryKey],
        // (d) => d[artistNameKey]
    );
    let root = d3.hierarchy(countryGroup, undefined);
    const v = ([, value]) => value;
    const sort = (a, b) => d3.descending(a.value, b.value);
    let padding = 3;
    let fill = "red"// fill for leaf circles
    let fillOpacity = .9 // fill opacity for leaf circles
    let stroke = "#bbb"
    let strokeWidth = 1 // stroke width for internal circles
    let strokeOpacity =1
    v == null ? root.count() : root.sum((d) => Math.max(0, v(d)));
    // Compute labels and titles.
    const descendants = root.descendants();
    const leaves = descendants.filter((d) => !d.children);
    leaves.forEach((d, i) => (d.index = i));
    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);
    console.log(root);
    d3.pack().size([width, height]).padding(padding)(root);

    const svg = d3
        .select("#" + chartContainerId)
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle");

    const node = svg
        .selectAll("a")
        .data(descendants)
        .join("a")
        .attr("xlink:href", null)

        .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
        .append("circle")
        .attr("fill", (d) => (d.children ? "#fff" : fill))
        .attr("fill-opacity", (d) => (d.children ? null : fillOpacity))
        .attr("stroke", (d) => (d.children ? stroke : null))
        .attr("stroke-width", (d) => (d.children ? strokeWidth : null))
        .attr("stroke-opacity", (d) => (d.children ? strokeOpacity : null))
        .attr("r", (d) => d.r);
}
draw();
