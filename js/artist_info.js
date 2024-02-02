// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

export function artistinfo(data, map, options) {

  console.log(data)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    title: 'title',
    location: 'location',
    pronouns: 'pronouns',
    rank: 'rank',
    type: 'type',
    rank_start: 'rank_start',
    rank_end: 'rank_end',
    artist_image: 'artist_image'
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 800,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    padding: 0.1,
    fill: "#69b3a2",
    stroke: "#000",
    label_offset: 30,
    focus: null,
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const div = d3.select(options.selector);

  const img_container = div.append('div')
    .classed('img_container', true);

    console.log(options.selector, div)

  const text_container = div.append('div')
    .classed('text_container', true);

  const title_div = text_container.append('div')
    .classed('title', true);

  const location_div = text_container.append('div')
    .classed('location', true);

  const pronouns_div = text_container.append('div')
    .classed('pronouns', true);

  const rank_div = text_container.append('div')
    .classed('rank', true);

  const rank_history_div = text_container.append('div')
    .classed('rank_history', true);

  ////////////////////////////////////////
  ////////////// Data Setup ///////////////
  ////////////////////////////////////////

  const img = img_container
    .selectAll("artist_image")
    .data(data)
    .join('img')
    .attr('src', d => d[map.artist_image])
    .classed('artist_image', true);

  const title = title_div
    .selectAll('h1')
    .data(data)
    .join('h1')
    .text(d => d[map.title]);

  const location = location_div
    .selectAll('p')
    .data(data)
    .join('p')
    .text(d => d[map.location]);

  const pronouns = pronouns_div
    .selectAll('p')
    .data(data)
    .join('p')
    .text(d => `${d[map.pronouns]}, ${d[map.type]}`);

  const rank = rank_div
    .selectAll('p')
    .data(data)
    .join('p')
    .text(d => `Peak Rank ${d[map.rank]}`);

  const rank_history = rank_history_div
    .selectAll('p')
    .data(data)
    .join('p')
    .text(d => `Starting: ${d[map.rank_start]} Ending: ${d[map.rank_end]}`);


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    if (newData != null) data = newData;

    console.log("artist details update:", data)

    const t = d3.transition().duration(options.transition).ease(d3.easeLinear)

    img
      .data(data)
      .transition(t)
      .attr('src', d => d[map.artist_image])

    title
      .data(data)
      .transition(t)
      .text(d => d[map.title]);

    location
      .data(data)
      .transition(t)
      .text(d => `:${d[map.location]}: ${d[map.location]}`);

    pronouns
      .data(data)
      .transition(t)
      .text(d => `${d[map.pronouns]}, ${d[map.type]}`);

    rank
      .data(data)
      .transition(t)
      .text(d => `Peak Rank ${d[map.rank]}`);

    rank_history
      .data(data)
      .transition(t)
      .text(d => `Starting: ${d[map.rank_start]} Ending: ${d[map.rank_end]}`);

  }


  return {
    update: update,
  }

};