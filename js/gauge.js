export function gauge(options) {

    ////////////////////////////////////////
    ////////////// Defaults ////////////////
    ////////////////////////////////////////

    let defaults = {
        selector: '#gauge',
        width: 800,
        height: 400,
        margin: { top: 50, right: 100, bottom: 50, left: 100 },
        fill: "#69b3a2",
        min: 0,
        max: 100,
        value: 50,
        transition: 1000,
        format: ".0%",
        barwidth: 100
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
        .attr('transform', `translate(${options.width / 2}, ${options.height})`);

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

    ////////////////////////////////////////
    ////////////// DOM Setup ///////////////
    ////////////////////////////////////////

    const background = svg.append("circle")
        .attr("r", options.width / 3)
        .attr("cx", 0)
        .attr("cy", -options.height / 3)
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


    const foregroundPath = svg.append('path')
        .attr('d', arc({ endAngle: scale(0) }))
        .attr('fill', options.fill)


    const leftLabel = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', (-options.width / 2) + options.margin.left + (options.barwidth / 2))
        .attr('y', -20)
        .attr('fill', '#000')
        .attr('font-size', '2em')
        .attr('font-weight', 'bold')
        .text(d3.format(options.format)(options.value))

    const rightLabel = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', (options.width / 2) - options.margin.right - (options.barwidth / 2))
        .attr('y', -20)
        .attr('fill', '#000')
        .attr('font-size', '2em')
        .attr('font-weight', 'bold')
        .text(d3.format(options.format)(scale.domain()[1] - options.value))



    function update(val) {

        // backgroundArc.endAngle(Math.PI / 2);

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
            .attrTween('d', function () {
                var i = d3.interpolate(scale(0), scale(val));
                return function (t) {
                    return arc({ endAngle: i(t) });
                }
            });
    }

    update(options.value)

    return {
        svg: svg,
        update: update
    };
}
