export function setupResizeListener(callback, selector, ...args) {
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      callback(...args);
    }, 50); // Adjust the timeout to your preference
  });
}

export function trimNames(str) {
  return str
    .replace(/[^a-zA-Z0-9-_]/g, "") // Remove special characters
    .replace(/\s/g, "_") // Replace spaces with underscores
    .replace(/\(|\)/g, "");
}
export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
export function chartDimensions(chartContainerId, customMargin = {}) {
  if (chartContainerId.includes("#")) {
    chartContainerId = chartContainerId.replace("#", "");
  }

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
