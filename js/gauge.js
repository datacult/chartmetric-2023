export function gauge(data, map, options) {

    ////////////////////////////////////////
    ////////////// Defaults ////////////////
    ////////////////////////////////////////

    let mapping = {
        label: 'label',
        value: 'value',
        fill: null,
    }

    let defaults = {
        selector: '#gauge',
        width: 800,
        height: 600,
        margin: { top: 50, right: 100, bottom: 200, left: 100 },
        fill: "#69b3a2",
        min: 0,
        max: 1,
        value: 0.5,
        transition: 1000,
        format: ".0%",
        barwidth: 100,
        legend: ['left', 'right']
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
        .attr('transform', `translate(${options.width / 2}, ${options.height - options.margin.bottom})`);


    ////////////////////////////////////////
    ////////////// Helpers /////////////////
    ////////////////////////////////////////

    const height = options.height - options.margin.top - options.margin.bottom;
    const width = options.width - options.margin.left - options.margin.right;

    ////////////////////////////////////////
    ////////////// Gradients ///////////////
    ////////////////////////////////////////

    let defs = svg.append("defs");

    //Filter for the outside glow
    var blur = defs.append("filter")
        .attr("id", "blur")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("height", "200%")
        .attr("width", "200%")
    blur.append("feGaussianBlur")
        .attr("stdDeviation", "50")
        .attr("result", "coloredBlur");

    ////////////////////////////////////////
    ////////////// Scales //////////////////
    ////////////////////////////////////////

    const scale = d3.scaleLinear()
        .domain([options.min, options.max])
        .range([-Math.PI / 2, Math.PI / 2]);
        
    const legendScale = d3.scaleBand()
        .domain(data.map(d => d[map.label]).sort((a, b) => a < b ? -1 : 1))
        .range([-width / 2, width / 2]);

    ////////////////////////////////////////
    ////////////// DOM Setup ///////////////
    ////////////////////////////////////////

    const background = svg.append("circle")
        .attr("r", options.width * 0.25)
        .attr("cx", 0)
        .attr("cy", -options.height * 0.25)
        .attr("fill", options.fill)
        .attr("fill-opacity", 0.5)
        .style("filter", `url(#blur)`)

    // Background Arc
    let arc = d3.arc()
        .innerRadius((options.width - options.margin.right - options.margin.left) / 2 - options.barwidth)
        .outerRadius((options.width - options.margin.right - options.margin.left) / 2)
        .startAngle(-Math.PI / 2)

    const backgroundPath = svg.append('path')
        .attr('d', arc({ endAngle: scale(0) }))
        .attr('fill', '#fff');

    const foregroundPath = svg
        .selectAll('.foreground-path')
        .data(data)
        .join('path')
        .attr('d', arc({ endAngle: scale(0) }))
        .attr('fill', d => map.fill != null ? d[map.fill] : options.fill)
        .classed('foreground-path', true);

    const labels = svg.selectAll('.label')
        .data(data)
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('x', (d, i) => i == 0 ? (-width / 2) + (options.barwidth / 2) : (width / 2) - (options.barwidth / 2))
        .attr('y', -20)
        .attr('fill', '#000')
        .attr('font-size', '2em')
        .attr('font-weight', 'bold')
        .text(d => d3.format(options.format)(d[map.value]))
        .classed('label', true)

    ////////////////////////////////////////
    /////////////// Legend /////////////////
    ////////////////////////////////////////

    // draw a small square under the graph for each color with a corresponding label
    const legend = svg.selectAll('.legend')
        .data(data)
        .join('g')
        .attr('transform', (d, i) => `translate(${legendScale(d[map.label])}, 50)`)
        .classed('legend', true)

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d => map.fill != null ? d[map.fill] : options.fill)

    legend.append('text')
        .attr('x', 30)
        .attr('y', 10)
        .attr('dy', '0.35em')
        .text(d => d[map.label])

    ////////////////////////////////////////
    /////////////// Update /////////////////
    ////////////////////////////////////////
    function update() {

        backgroundPath
            .transition()
            .duration(options.transition)
            .attrTween('d', function () {
                var i = d3.interpolate(scale(0), scale(1));
                return function (t) {
                    return arc({ endAngle: i(t) });
                }
            });

        foregroundPath
            .transition()
            .duration(options.transition)
            .attrTween('d', function (d) {
                var i = d3.interpolate(scale(0), scale(d[map.value]));
                return function (t) {
                    return arc({ endAngle: i(t) });
                }
            });
    }

    update()

    return {
        svg: svg,
        update: update
    };
}
