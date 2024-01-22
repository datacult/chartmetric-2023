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
    // height = 200, // height of the chart, in pixels
    cellSize = 17, // width and height of an individual day, in pixels
    weekday = "monday", // either: weekday, sunday, or monday
    yFormat, // format specifier string for values (in the title)
    colors = d3.interpolatePiYG,
    // formatDay = (i) => "SMTWTFS"[i],
    formatDay = (i) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i], // given a day number in [0, 6], the day-of-week label
    formatMonth = "%b", // format specifier string for months (above the chart)
    monthSpace = 50, // vertical space allocated for month labels
    paddingBetweenCells = 5,
  } = {}
) {
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const I = d3.range(X.length);
  // Compute values.

  const countDay = weekday === "sunday" ? (i) => i : (i) => (i + 6) % 7;
  const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
  const weekDays = weekday === "weekday" ? 5 : 7;
  const height = cellSize * (weekDays + 2);

  // Compute a color scale. This assumes a diverging color scheme where the pivot
  // is zero, and we want symmetric difference around zero.
  const max = d3.quantile(Y, 0.9975, Math.abs);

  const color = d3
    .scaleSequential(d3.interpolateGnBu)
    .domain(d3.extent(data, y));

  // Construct formats.
  formatMonth = d3.utcFormat(formatMonth);
  // Group data by year, in reverse input order. (Since the dataset is chronological,
  // this will show years in reverse chronological order.)
  // Group the index by year, in reverse input order. (Assuming that the input is
  // chronological, this will show years in reverse chronological order.)
  const years = d3.groups(I, (i) => X[i].getUTCFullYear()).reverse();

  function pathMonth(t) {
    const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));
    const w = timeWeek.count(d3.utcYear(t), t);
    return `${d === 0
        ? `M${w * cellSize},0`
        : d === weekDays
          ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`
      }V${weekDays * cellSize}`;
  }

  const year = svg
    .selectAll("g")
    .data(years)
    .join("g")
    .attr(
      "transform",
      (d, i) => `translate(${monthSpace},${height * i + cellSize * 1.5})`
    );
  // each year
  // there is a weekday
  year
    .append("g")
    .attr("text-anchor", "start")
    .attr("class", "weekday-2-6")
    .selectAll("text")
    .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
    .join("text")
    .attr("y", -15)
    .attr("x", (i) => (countDay(i) + 0.1) * (cellSize + paddingBetweenCells))
    .attr("dx", "0.31em")
    .attr(
      "transform",
      (i) =>
        `rotate(90, ${(countDay(i) + 0.1) * (cellSize + paddingBetweenCells)
        }, -15)`
    )
    .text(formatDay);
  // .
  // .attr('transform', 'rotate(90)');

  const cell = year
    .append("g")
    .selectAll("rect")
    .data(
      weekday === "weekday"
        ? ([, I]) => I.filter((i) => ![0, 6].includes(X[i].getUTCDay()))
        : ([, I]) => I
    )
    .join("rect")
    .attr("width", cellSize - 1)
    .attr("height", cellSize - 1)
    .attr(
      "x",
      (i) => countDay(X[i].getUTCDay()) * (cellSize + paddingBetweenCells) + 0.5
    )
    // d3.utcYear is the last day of last year
    // below counts how many weeks have passed since the last day of last year
    .attr(
      "y",
      (i) =>
        timeWeek.count(d3.utcYear(X[i]), X[i]) *
        (cellSize + paddingBetweenCells) +
        0.5
    )

    .attr("fill", (i) => color(Y[i]));

  const month = year
    .append("g")

    .selectAll("g")
    .data(([, I]) =>
      d3.utcMonths(
        d3.utcMonth.floor(X[I[I.length - 1]]),
        d3.utcMonth.ceil(X[I[0]])
      )
    )
    .join("g")
    .attr("text-anchor", "end");

  // month
  //   .filter((d, i) => i)
  //   .append("path")
  //   .attr("fill", "none")
  //   .attr("stroke", "#fff")
  //   .attr("stroke-width", 3)
  //   .attr("d", pathMonth);

  month
    .append("text")
    .attr("class", "month-2-6")
    .attr(
      "y",
      (d) =>
        timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) *
        (cellSize + paddingBetweenCells) +
        cellSize +
        paddingBetweenCells
    )
    .attr("x", -10)
    .text(formatMonth);

  const photoData = [
    { date: "2023-02-24", name: "Cupid", artist: "FIFTY FIFTY" },
    {
      date: "2023-03-17",
      name: "Ella Baila Sola",
      artist: "Eslabon Armado and Peso Pluma",
    },
    { date: "2023-05-18", name: "Padam Padam", artist: "Kylie Minogue" },
    { date: "2023-07-28", name: "Back on 74", artist: "Jungle" },
    {
      date: "2023-09-13",
      name: "Will Anybody Ever Love Me?",
      artist: "Sufjan Stevens",
    },
    { date: "2023-12-08", name: "FTCU", artist: "Nicki Minaj" },
  ];

  const photoContainer = d3
    .select("#rotatingPhotos")
    .selectAll(".photo-frame")
    .data(photoData)
    .enter()
    .append("div")
    .style("width", cellSize*3+"px")
    .style("height", cellSize*3+"px")
    .attr("class", "photo-frame")
    .style("top", ({ date, name }) => {
      const d = new Date(date);
      let value =
        timeWeek.count(d3.utcYear(d), timeWeek.floor(d)) *
        (cellSize + paddingBetweenCells) +
        cellSize +
        paddingBetweenCells;
     
      return value + "px";
    })
    .style("transform", function () {
      // Generate a random rotation angle between -20 and 20 degrees for each photo frame
      const angle = Math.floor(Math.random() * 41) - 20;
      return `rotate(${angle}deg)`;
    });

  photoContainer
    .append("img")
    .attr("src", "./assets/cupid.png") // Replace with the actual path to your images
    .attr("alt", "Photo")
    .on("mouseover", function () {
      // d3.select('').style("display", "block");
      d3.select(this.parentNode).select(".photo-hover").style("display", "flex");
    }).
    on("mouseout", function () {
      d3.select(this.parentNode).select(".photo-hover").style("display", "none");
    });

    photoContainer
    .append("div")
    .attr("class", "photo-hover")
    .style("display", "none").html(d=>`
    <div class="track-name">${d.name}</div>
    <div class="artist-name">${d.artist}</div>
    <div class="date">${d.date}</div>
    `);
}
