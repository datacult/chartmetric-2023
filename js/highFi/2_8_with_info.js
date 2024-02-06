import { trimNames } from '../utility.js'

import { artistinfo } from '../artist_info.js';

export function viz_2_8(data, map, options) {

    ////////////////////////////////////////
    /////////////// Defaults ///////////////
    ////////////////////////////////////////

    let mapping = {
        x: "x",
        y: "y",
        group: "group",
        sort: null
    };

    // merge default mapping with user mapping
    map = { ...mapping, ...map };

    let defaults = {
        selector: "#vis",
        width: 1200,
        height: 600,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        transition: 400,
        delay: 100,
        fill: "#69b3a2",
        stroke: "#000",
        padding: 0.1,
        opacity: 0.3,
        focus: null
    };

    // merge default options with user options
    options = { ...defaults, ...options };

    ////////////////////////////////////////
    ////////////// DIV Setup ///////////////
    ////////////////////////////////////////

    const div = d3.select(options.selector);

    const vis_container = div.append('div')
        .classed('vis-svg-container', true);

    const info_container = div.append('div')
        .attr('id', 'artist_info_container')
        .classed('info_container', true);

    ////////////////////////////////////////
    ////////////// SVG Setup ///////////////
    ////////////////////////////////////////

    const svg = vis_container.append('svg')
        .attr('width', '100%') // Responsive width
        .attr('height', '100%') // Responsive height
        .attr('viewBox', `0 0 ${options.width} ${options.height}`)
        .classed('vis-svg', true)
        .append('g')
        .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

    ////////////////////////////////////////
    ////////////// Helpers /////////////////
    ////////////////////////////////////////

    const height = options.height - options.margin.top - options.margin.bottom;
    const width = options.width - options.margin.left - options.margin.right;

    ////////////////////////////////////////
    ////////////// Transform ///////////////
    ////////////////////////////////////////


    // Assuming `data` is your array of objects from the CSV
    const uniqueMonths = [...new Set(data.map(item => {
        return JSON.stringify({[map.x]: item[map.x], [map.sort]: item[map.sort]})
    }))];

    const artistsInfo = {}; // Object to hold artist name to ID mapping

    // Populate artistsInfo with artist names as keys and their IDs as values
    data.forEach(item => {
        if (!artistsInfo[item[map.group]]) {
            artistsInfo[item[map.group]] = item;
        }
    });

    let info = artistinfo(options.focus != null ? [artistsInfo[options.focus]] : [], map, { selector: '#artist_info_container' });

    // Function to find an entry for a specific month and artist
    function findEntry(month, artist) {
        return data.find(item => item[map.x] === month && item[map.group] === artist);
    }

    // Fill in missing entries
    let filledData = [...data]; // Clone the original data
    uniqueMonths.forEach(month => {
        month = JSON.parse(month)
        Object.keys(artistsInfo).forEach(artist => {
            const entryExists = findEntry(month[map.x], artist);
            if (!entryExists) {
                filledData.push({
                    ...artistsInfo[artist],
                    [map.x]: month[map.x],
                    [map.sort]: month[map.sort],
                    [map.group]: artist,
                    [map.y]: 10
                });
            }
        });
    });

    if (map.sort) filledData = d3.sort(filledData, (a, b) => d3.ascending(a[map.sort], b[map.sort]))

    let nestedData = d3.groups(filledData, d => d[map.group])
        .map(group => ({ name: group[0], values: group[1] }));

    let firstAppearance = data.reduce((accumulator, current) => {
        if (!accumulator.some(d => d[map.group] === current[map.group])) {
            accumulator.push(current);
        }
        return accumulator;
    }, []);


    ////////////////////////////////////////
    ////////////// Scales //////////////////
    ////////////////////////////////////////

    const xScale = d3
        .scalePoint()
        .domain(data.map(d => d[map.x]))
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d[map.y])])
        .range([0, height]);

    ////////////////////////////////////////
    ////////////// DOM Setup ///////////////
    ////////////////////////////////////////

    // Area generator
    const area = d3
        .area()
        .x((d) => xScale(d[map.x]))
        .y0((d) => (d[map.y] === 10 ? height : yScale(d[map.y] - 1)))
        .y1((d) => yScale(d[map.y]))
        .curve(d3.curveBumpX);

    // Drawing areas
    let paths = svg
        .selectAll(".area")
        .data(nestedData)
        .join("path")
        .attr("d", (d) => area(d.values))
        .attr("fill", options.fill)
        .attr("opacity", options.opacity)
        .on("click", function (event, d) {
            options.focus = d.name;
            info.update([artistsInfo[d.name]]);
            labels.attr("font-weight", x => options.focus == x[map.group] ? "bold" : "normal");
            paths.attr("opacity", x => options.focus == x.name ? 1 : options.opacity);
        })
        .on("mouseover", function (event, d) {
            d3.select(this).attr("opacity", x => options.focus == x.name ? 1 : 0.7);
        })
        .on("mouseout", function (event, d) {
            paths.attr("opacity", x => options.focus == x.name ? 1 : options.opacity);
        });

    let labels = svg
        .selectAll(".labels")
        .data(firstAppearance)
        .join("text")
        .attr("class", "labels")
        .attr("x", (d) => xScale(d[map.x]))
        .attr("y", (d) => yScale(d[map.y] - 0.5))
        .text((d) => d[map.group])
        .on("click", function (event, d) {
            options.focus = d[map.group];

            info.update([artistsInfo[d[map.group]]]);
            paths.attr("opacity", x => d[map.group] == x.name ? 1 : options.opacity);
            labels.attr("font-weight", x => d[map.group] == x[map.group] ? "bold" : "normal");
        })


    ////////////////////////////////////////
    //////////////// Axis //////////////////
    ////////////////////////////////////////

    const xAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    ////////////////////////////////////////
    ////////////// Update //////////////////
    ////////////////////////////////////////

    function update(newData = data, focus) {

        paths
            .transition()
            .duration(options.transition)
            .attr("opacity", d => d.name == focus ? 1 : options.opacity);

        info.update(newData.filter(d => d[map.group] == focus));

    }

    update(data, options.focus)

    return {
        update: update,
    };


}