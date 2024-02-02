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
export function setupResponsiveDimensions(elementId, margins, onResizeCallback, debounceTime = 100) {
  const defaultMargins = { top: 0, right: 0, bottom: 0, left: 0 };
  const effectiveMargins = { ...defaultMargins, ...margins };

  const element = document.getElementById(elementId);
  if (!element) {
      console.error(`Element with id '${elementId}' not found.`);
      return;
  }

  function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
              func(...args);
          }, wait);
      };
  }

  function computeDimensions() {
      const rect = element.getBoundingClientRect();
      return {
          width: rect.width - effectiveMargins.left - effectiveMargins.right,
          height: rect.height - effectiveMargins.top - effectiveMargins.bottom,
          margins: effectiveMargins
      };
  }

  const debouncedOnResize = debounce(() => {
      const dimensions = computeDimensions();
      onResizeCallback(dimensions);
  }, debounceTime);

  const resizeObserver = new ResizeObserver(debouncedOnResize);
  resizeObserver.observe(element);

  // Initial dimensions
  debouncedOnResize();
}

// Make the Canvas element DPi
export function setPixelDensity(canvas, width, height) {

  // Get the device pixel ratio.
  let pixelRatio = window.devicePixelRatio;

  // Set our canvas size equal to that of the screen size x the pixel ratio.
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  // Shrink back down the canvas CSS size by the pixel ratio, thereby 'compressing' the pixels.
  canvas.style.width = (canvas.width / pixelRatio) + 'px';
  canvas.style.height = (canvas.height / pixelRatio) + 'px';
  
  // Fetch the context.
  let context = canvas.getContext('2d');

  // Scale all canvas operations by the pixelRatio, so you don't have to calculate these manually.
  context.scale(pixelRatio, pixelRatio);

  // Return the modified context.
  return context;
} 
