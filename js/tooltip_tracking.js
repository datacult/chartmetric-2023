export function tooltip_tracking(data, map, options) {


    data = []

    for (let i = 0; i < 5; i++) {
        data.push({ x: Math.random(), y: Math.random() })
    }

    ////////////////////////////////////////
    ////////////// Defaults ////////////////
    ////////////////////////////////////////

    let mapping = {
        x: 'x',
        y: 'y'
    };

    // Merge default options with user options
    map = { ...mapping, ...map };

    let defaults = {
        selector: '#vis',
        width: 800,
        height: 600,
        margin: { top: 20, right: 0, bottom: 0, left: 0 },
    };

    // Merge default options with user options
    options = { ...defaults, ...options };


    ////////////////////////////////////////
    ////////////// SVG Setup ///////////////
    ////////////////////////////////////////

    const div = d3.select(options.selector);

    const container = div.append('div')
        .classed('vis-svg-container', true);

    const svg = container.append('svg')
        .attr('width', '100%') // Responsive width
        .attr('height', '100%') // Responsive height
        .attr('viewBox', `0 0 ${options.width} ${options.height}`)
        .classed('vis-svg', true)
        .append('g')
        .attr('transform', `translate(${options.margin.left}, ${options.margin.top})`);


    ////////////////////////////////////////
    ////////////// Helpers /////////////////
    ////////////////////////////////////////

    const height = options.height - options.margin.top - options.margin.bottom;
    const width = options.width - options.margin.left - options.margin.right;


    ////////////////////////////////////////
    ////////////// Scales //////////////////
    ////////////////////////////////////////

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[map.x]))
        .range([0, width])

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[map.y])])
        .range([height, 0])

    const containerDim = container.node().getBoundingClientRect()

    console.log(containerDim)

    const viewBoxScaleX = d3.scaleLinear()
        .domain([0, containerDim.width])
        .range([0, options.width])

    const viewBoxScaleY = d3.scaleLinear()
        .domain([0, containerDim.height])
        .range([0, options.height])

    console.log(viewBoxScaleX(250))

    ////////////////////////////////////////
    ////////////// DOM Setup ///////////////
    ////////////////////////////////////////

    // add tooltip to svg
    const tooltip = d3.select(options.selector).append("div")
        .attr("class", options.selector.substring(1) + "_tooltip")
        .style("position", "fixed")
        .style("pointer-events", "none")

    // rect the whole svg
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "blue")
        .attr("pointer-events", "all")
        .on("mousemove", function (event, d) {

            tooltip
                .style("left", event.clientX + "px")
                .style("top", event.clientY + "px")
                .html(`translated mouse event - x: ${viewBoxScaleX(event.offsetX).toFixed(2)} y: ${viewBoxScaleY(event.offsetY).toFixed(2)}`)
        })


    svg.selectAll(".dots")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d[map.x]))
        .attr("cy", d => yScale(d[map.y]))
        .attr("r", 5)
        .attr("fill", "black")
        .attr("pointer-events", "none")
        .classed("dots", true)

    svg.selectAll(".text")
        .data(data)
        .join("text")
        .attr("x", d => xScale(d[map.x]) + 20)
        .attr("y", d => yScale(d[map.y]))
        .attr("fill", "black")
        .attr("pointer-events", "none")
        .text(d => `x: ${xScale(d[map.x]) + options.margin.left} , y: ${yScale(d[map.y]) + options.margin.top}`)
        .classed("text", true)


    ////////////////////////////////////////
    /////////////// Update /////////////////
    ////////////////////////////////////////
    function update() {

    }

    update()

    return {
        svg: svg,
        update: update
    };
}
