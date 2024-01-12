export function chartDimensions(chartContainerId, customMargin = {}) {
    // Define default margin settings
    const defaultMargin = { top: 0, right: 10, bottom: 0, left: 0 };

    // Merge customMargin with defaultMargin
    const margin = { ...defaultMargin, ...customMargin };

    // Get the element by its ID
    const visElement = document.getElementById(chartContainerId);

    // Get the bounding rectangle of the element
    const { width, height } = visElement.getBoundingClientRect();
    const boundedWidth = width - margin.left - margin.right;
    const boundedHeight = height - margin.top - margin.bottom;

    return {
        width,
        height,
        margin,
        boundedWidth,
        boundedHeight,
    };
}