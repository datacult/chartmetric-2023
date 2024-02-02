
export function CalendarComponent(
  svg,
  data,
  {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    dimensions,
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
  // Compute values.
  const { width, margins } = dimensions;
  const X = data.map(x);

  const Y = data.map(y);
  const I = d3.range(X.length);

  const countDay = weekday === "sunday" ? (i) => i : (i) => (i + 6) % 7;
  const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
  const weekDays = weekday === "weekday" ? 5 : 7;
  const height =
    cellSize *
    timeWeek.count(d3.utcYear(new Date("2023-01-01")), new Date("2023-12-30"));

  d3.select("#calendarHeatmap").style("height", height + cellSize * 3 + "px");
  // Compute a color scale. This assumes a diverging color scheme where the pivot
  // is zero, and we want symmetric difference around zero.
  const max = d3.quantile(Y, 0.9975, Math.abs);
  const color = d3.scaleSequential(colors).domain(d3.extent(data, y));

  // Construct formats.
  formatMonth = d3.utcFormat(formatMonth);

  // Group the index by year, in reverse input order. (Assuming that the input is
  // chronological, this will show years in reverse chronological order.)
  const years = d3.groups(I, (i) => X[i].getUTCFullYear()).reverse();

  function pathMonth(t) {
    // t is the last day of the month
    // count day returns  所处的一周内的天数
    // Math.min保证了哪怕 countDay超过7，也能cap at 7
    // Math.max保证了哪怕 小于0，也能cap at 0
    const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));

    // 从d3.utcYear(t)到t,一共几周
    const w = timeWeek.count(d3.utcYear(t), t);
    // console.log(
    //   "相当于Y值：所处于的周，的第几天，可能从周日开始算，可能从周一开始算。取决于开始的选项",
    //   d
    // );
    // console.log("相当于X值：", w);

    return `${d === 0
      ? // 周一到了，从0开始，y= 0，x=已经过了几周
      `M0,${w * cellSize}`
      : d === weekDays
        ? // 到了一周的最后一天（7），则从下一周的0开始
        `M0,${(w + 1) * cellSize}`
        : // +1 是因为要画在底部
        `M${paddingBetweenCells * 0.5},${(w + 1) * cellSize}H${d * cellSize
        }V${w * cellSize}`
      }H${weekDays * cellSize - paddingBetweenCells * 0.5}`;
  }

  console.log(margins);
  const year = svg
    .selectAll("g")
    .data(years)
    .join("g")
    .attr(
      "transform",
      (d, i) => `translate(${margins?.left ?? 40.5},${cellSize * 1.5})`
    );

  year
    .append("g")
    .attr("text-anchor", "start")
    .selectAll("text")
    .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
    .join("text")
    .attr("y", -5)
    .attr("x", (i) => countDay(i) * cellSize + cellSize * 0.6)
    .attr('class', 'calendar-day-label')
    .attr("dy", "0.5em")
    .attr("dx", "-2em")
    .text(formatDay)
    .attr("transform", (i) => `rotate(${90}, ${countDay(i) * cellSize + cellSize * 0.6}, -5)`);

  const cell = year
    .append("g")
    .selectAll("rect")
    .data(
      ([, I]) => {
        return I;
      } // pass the data as it is
    )
    .join("rect")
    .attr("width", cellSize - paddingBetweenCells)
    .attr("height", cellSize - paddingBetweenCells)
    // 和pathMonth一样
    // countDay直接告诉你今天是一周内的第几天
    .attr("x", (i) => countDay(X[i].getUTCDay()) * cellSize + 0.5)
    // 今年第一天：d3.utcYear(X[i])
    // 当天X[i]
    // 算出隔了几周，每有一周，就另起一行
    .attr("y", (i) => timeWeek.count(d3.utcYear(X[i]), X[i]) * cellSize)
    .attr("fill", (i) => {
      return color(Y[i]);
    });

  if (title) cell.append("title").text(title);

  const month = year
    .append("g")
    .selectAll("g")
    .data(([, I]) => {
      return d3.utcMonths(d3.utcMonth(X[I[0]]), X[I[I.length - 1]]);
    })
    .join("g");

  let pathStrokeWidth = 1.2;
  month
    .filter((d, i) => {
      return i;
    })
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#1C1C1C")
    .attr("stroke-width", pathStrokeWidth)
    .attr("d", (d) => {
      return pathMonth(d);
    })
    .attr(
      "transform",
      `translate(${-paddingBetweenCells * 0.5 + pathStrokeWidth / 2},${-paddingBetweenCells * 0.5
      })`
    );
  month
    .append("text")
    .attr('class', 'calendar-month-label')
    .attr("x", 0)
    .attr(
      "y",
      (d) => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2
    )

    .text(formatMonth)
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
  {/* 
  <div class="photo-card">
  <div class="image-container">
    <img src=" 
     </div>
  <div class="text-container">
    <h1>"Cupid"</h1>
    <p>FIFTY FIFTY</p>
    <hr>
    <p>FEBRUARY 24</p>
  </div>
</div> */}
  const photoCard = d3
    .select("#rotatingPhotos")
    .selectAll(".photo-card")
    .data(photoData)
    .enter()
    .append("div")
    .style("width", cellSize * 3 + "px")
    .style("height", cellSize * 3 + "px")
    .style("top", ({ date, name }) => {
      const d = new Date(date);
      let value =
        timeWeek.count(d3.utcYear(d), timeWeek.floor(d)) *
        (cellSize + paddingBetweenCells) +
        cellSize +
        paddingBetweenCells;

      return value + "px";
    })
 
    // photo
  photoCard.append("div").attr('class', 'image-container')
    .append('img')
    .attr("src", "./assets/cupid.png")
    .attr("alt", "Photo")
    .style("transform", function () {
      // Generate a random rotation angle between -20 and 20 degrees for each photo frame
      const angle = Math.floor(Math.random() * 41) - 20;
      return `rotate(${angle}deg)`;
    }); 
    // text next to photo
  photoCard.append("div").attr('class', 'text-container').html(`iv class="text-container">
    <h1>"Cupid"</h1>
    <p>FIFTY FIFTY</p>
    <hr>
    <p>FEBRUARY 24</p>`)
  // photoContainer
  //   .append("img")
  //   .attr("src", "./assets/cupid.png") // Replace with the actual path to your images
  //   .attr("alt", "Photo")
  //   .on("mouseover", function () {
  //     // d3.select('').style("display", "block");
  //     d3.select(this.parentNode)
  //       .select(".photo-hover")
  //       .style("display", "flex");
  //   })
  //   .on("mouseout", function () {
  //     d3.select(this.parentNode)
  //       .select(".photo-hover")
  //       .style("display", "none");
  //   });

  // photoContainer
  //   .append("div")
  //   .attr("class", "photo-hover")
  //   .style("display", "none")
  //   .html(
  //     (d) => `
  //   <div class="track-name">${d.name}</div>
  //   <div class="artist-name">${d.artist}</div>
  //   <div class="date">${d.date}</div>
  //   `
  //   );
}
