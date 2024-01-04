// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
export function Calendar(
  svg,
  data,
  {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    width = 928, // width of the chart, in pixels
    cellSize = 17, // width and height of an individual day, in pixels
    weekday = "monday", // either: weekday, sunday, or monday
    formatDay = (i) => "SMTWTFS"[i], // given a day number in [0, 6], the day-of-week label
    formatMonth = "%b", // format specifier string for months (above the chart)
    yFormat, // format specifier string for values (in the title)
    colors = d3.interpolatePiYG,
    paddingBetweenCells = 1,
  } = {}
) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const I = d3.range(X.length);

  const countDay = weekday === "sunday" ? (i) => i : (i) => (i + 6) % 7;
  const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
  const weekDays = weekday === "weekday" ? 5 : 7;
  //   const height = cellSize * (weekDays + 2);
  const numWeeks = d3.utcSunday.count(d3.utcYear(X[0]), X[X.length - 1]);

  const height = cellSize * numWeeks;
  // Compute a color scale. This assumes a diverging color scheme where the pivot
  // is zero, and we want symmetric difference around zero.
  const max = d3.quantile(Y, 0.9975, Math.abs);
  const color = d3
    .scaleQuantize(
      d3.extent(data, (d) => d.DAILY_TRACK_COUNT),
      colors
    )
    .unknown("none");

  // Construct formats.
  formatMonth = d3.utcFormat(formatMonth);

  // Compute titles.
  if (title === undefined) {
    const formatDate = d3.utcFormat("%B %-d, %Y");
    const formatValue = color.tickFormat(100, yFormat);
    title = (i) => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
  } else if (title !== null) {
    const T = d3.map(data, title);
    title = (i) => T[i];
  }

  // Group the index by year, in reverse input order. (Assuming that the input is
  // chronological, this will show years in reverse chronological order.)
  const years = d3.groups(I, (i) => X[i].getUTCFullYear()).reverse();

  // Adjust the pathMonth function for vertical layout
  function pathMonth(t) {
    const firstDay = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1));
    const lastDay = new Date(
      Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)
    );
    const firstDayWeek = timeWeek.count(d3.utcYear(firstDay), firstDay);
    const lastDayWeek = timeWeek.count(d3.utcYear(lastDay), lastDay);

    // If the month starts on a Monday, there is no need to draw the top path,
    // so move to the position directly. Otherwise, move to the start of the month,
    // and then draw up to the first cell.
    const pathStart =
      `M0,${firstDayWeek * cellSize}` +
      (countDay(firstDay.getUTCDay()) === 0
        ? ``
        : `H${countDay(firstDay.getUTCDay()) * cellSize}`);

    // Draw down to the last week of the month
    const pathDown = `V${lastDayWeek * cellSize}`;

    // Draw the bottom line of the month. If the month ends on a Sunday,
    // draw all the way to the right. Otherwise, draw to the last day of the month.
    const pathEnd =
      countDay(lastDay.getUTCDay()) === 6
        ? `H${weekDays * cellSize}` // Draw all the way to the right
        : `H${(countDay(lastDay.getUTCDay()) + 1) * cellSize}V${
            (lastDayWeek + 1) * cellSize
          }`; // Draw to the last day and down to the next row

    // Combine the path commands
    return pathStart + pathDown + pathEnd;
  }

  // Group the index by year, in reverse input order. (Assuming that the input is
  // chronological, this will show years in reverse chronological order.)
  // each year is a g element
  const year = svg
    .selectAll("g")
    .data(years)
    .join("g")
    .attr(
      "transform",
      (d, i) => `translate(${width *.1},${height * i + cellSize * 1.5})`
    );

  // text for year
  // year
  //   .append("text")
  //   .attr("x", -5)
  //   .attr("y", -5)
  //   .attr("font-weight", "bold")
  //   .attr("text-anchor", "end")
  //   .text(([key]) => key);

  // weekday text
  year
    .append("g")
    .attr("text-anchor", "end")
    .selectAll("text")
    .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
    .join("text")

    .attr("x", (i) => (countDay(i) + .6) * cellSize)
    .attr("y", 0)
    .attr("dx", "0.1em")
    .text(formatDay);

  // rect for each day
  const paddedCellSize = cellSize - paddingBetweenCells;
  const cell = year
    .append("g")
    .selectAll("rect")
    .data(
      weekday === "weekday"
        ? ([, I]) => I.filter((i) => ![0, 6].includes(X[i].getUTCDay()))
        : ([, I]) => I
    )
    .join("rect")
    .attr("width", paddedCellSize)
    .attr("height", paddedCellSize)
    .attr("y", (i) => timeWeek.count(d3.utcYear(X[i]), X[i]) * cellSize + .5)
     .attr("x", (i) => countDay(X[i].getUTCDay()) * cellSize + .5)
    .attr("rx", 3)
    .attr("fill", (i) => color(Y[i]));

  if (title) cell.append("title").text(title);

  const month = year
    .append("g")
    .selectAll("g")
    .data(([, I]) => {
      // Make sure to sort the dates to get the correct start and end for the range
      const dates = I.map((i) => X[i]).sort(d3.ascending);
      return d3.utcMonths(d3.utcMonth(dates[0]), dates[dates.length - 1]);
    })
    .join("g");

//   month
//     .filter((d, i) => i)
//     .append("path")
//     .attr("fill", "none")
//     .attr("stroke", "red")
//     .attr("stroke-width", 3)
//     .attr("d", pathMonth);

  month
    .append("text")
    .attr(
      "y",
      (d) => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + cellSize*.5+5
    )
    .attr("x", -5)
    .attr("text-anchor", "end")
    .attr("font-size", 12)
    .text(formatMonth);
}
