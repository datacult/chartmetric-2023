export function createRoundGradient(
    selector,
    width,
    height,
    radius,
    innerColor,
    outerColor,
    gradientId,
    inset,
    stdDeviation=50,
    radiusScale=1.5
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
        if (inset) {
            svg.style("inset", inset)
        }
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
        .attr("r", radius * radiusScale )
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
        .attr("stdDeviation", stdDeviation)
        .attr("result", "coloredBlur");

    // Apply the filter to the SVG container
    svg.style("filter", `url(#${gradientId}-glow)`);
}