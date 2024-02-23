import { chartDimensions } from "../chartDimensions.js";
let url = "https://share.chartmetric.com/year-end-report/2023/viz_2_8_en.csv";

export async function draw(
  dataUrl = url,
  chartContainerId = "vis",
  widthKey,
  selectedValue
) {
  const nodeId = "source";
  const padding = 40;
  const padding_chart = 75;
  /***********************
   *1. Access data
   ************************/
  let data = await d3.csv(dataUrl, d3.autoType);

  console.log(data);
  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth: width, boundedHeight: height } =
    chartDimensions(chartContainerId);

  /***********************
   *3. Set up canvas
   ************************/
  const visElement = document.getElementById(chartContainerId);
  const svg = d3
    .select(visElement)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  /***********************
   *4. Create scales
   ************************/

  const groupedData = d3.groups(data, (d) => d.NAME);

  // Function to fill in the missing months for each artist
  function fillMissingMonths(data) {
    return data.map(([artistName, entries]) => {
      // Create a map with all months set to a default object
      const monthEntries = new Map(
        Array.from({ length: 12 }, (_, i) => [
          i + 1,
          {
            SCORE_MONTH: i + 1,
            CM_ARTIST: 0,
            NAME: artistName,
            SCORE_25_75: 0,
            MONTHLY_ARTIST_RANK: 0,
          },
        ])
      );

      // Fill in the existing data
      entries.forEach((entry) => {
        monthEntries.set(entry.SCORE_MONTH, entry);
      });

      // Convert the map back to an array
      const completeEntries = Array.from(monthEntries.values());

      return { id: artistName, data: completeEntries };
    });
  }

  // Apply the function to fill in missing months
  const completedGroupedData = fillMissingMonths(groupedData);

  let xKey = "SCORE_MONTH";
  let bandWidth = 50;
  let yKey = "CM_ARTIST";
  const xAccessor = (d, xKey) => d[xKey];
  const slices = [];
  //* For each artist, create a artists
  completedGroupedData.forEach((artist) => {
    //* For each artist, there is 12 months. Here we loop through each month
    artist.data.forEach((month) => {
      // let's find the month in `slice` array
      let slice = slices.find((s) => s.id === month[xKey]);
      if (!slice) {
        slice = {
          id: xAccessor(month, xKey),
          total: 0,
          values: [],
          x: 0,
          monthlyRank: month["MONTHLY_ARTIST_RANK"]
        };
        slices.push(slice);
      }

      // bandwidth is the height of each band
      const total = slice.total + bandWidth;
      slice.total = total;

      // for each month
      slice.values.push({
        artistId: artist.id,
        value: month[yKey],
        position: 0,
        height: 0,
        beforeHeight: 0,
      });
    });
  });
  const xScale = d3
    .scalePoint()
    .domain(slices.map((slice) => slice.id))
    .range([0, width]);

  const heightScale = d3
    .scaleBand()
    .domain([0, [...new Set(d3.map(data, (d) => d[xKey]))]])
    .range([0, height]);

  slices.forEach((month) => {
    // pixel value for x, each month
    month.x = xScale(month.id);

    //
    month.values .sort((a, b) => b.value - a.value).forEach((value) => {
      
    });
  });
  console.log(slices);
  /***********************
   *5. Draw canvas
   ************************/
}
