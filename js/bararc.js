// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { barchart } from './barchart.js';
import { arcchart } from './arc.js';

export function barArc(data, options, bar_map, arc_map){

  //data cleaning
  data.forEach(d => {
    if (d['START_STAGE'] == 'Mid-level') {
      d['START_STAGE'] = 'Mid-Level'
    }
  })

  let detailMap = {
    "Undiscovered": { "bar": "#274978", "line": "#23426D", "label": "All other artists" },
    "Developing": { "bar": "#E7F2FF", "line": "#33609E", "label": "All other artists" },
    "Mid-Level": { "bar": "#9ADBD6", "line": "#A4DCE0", "label": "Top ~12K–35K artists" },
    "Mainstream": { "bar": "#75B2D3", "line": "#5899CB", "label": "Top ~1.6K–12K artists" },
    "Superstar": { "bar": "#71D6AD", "line": "#68D4A4", "label": "Top ~1.5K artists" },
    "Legendary": { "bar": "#24AE87", "line": "#0BA07C", "label": "Superstar artists with releases over 30 years old" }
  }

  data.forEach(d => {
    d['START_STROKE'] = detailMap[d['START_STAGE']].line,
      d['END_STROKE'] = detailMap[d['END_STAGE']].line
  });

  let stages = Object.keys(detailMap)

  let rollup = stages.map(stage => {

    let obj =
    {
      'stage': stage,
      'start_total': d3.sum(data.filter(x => x['START_STAGE'] == stage), d => d['ARTIST_COUNT']),
      'end_total': d3.sum(data.filter(x => x['END_STAGE'] == stage), d => d['ARTIST_COUNT']),
      'move_in_total': d3.sum(data.filter(x => x['END_STAGE'] == stage && x['START_STAGE'] != stage), d => d['ARTIST_COUNT']),
      'fill': detailMap[stage].bar,
      'stroke': detailMap[stage].line,
      'label': detailMap[stage].label
    }

    stages.forEach(s => {
      if (s != stage) {
        obj[s] = d3.sum(data.filter(x => x['START_STAGE'] == s && x['END_STAGE'] == stage), d => d['ARTIST_COUNT'])
      } else {
        obj[s] = 0
      }
    })

    return obj
  })

  let bar_mapping = {
    y: "end_total",
    x: "stage",
    fill: "fill",
    stroke: "stroke",
  }

  bar_map = { ...bar_mapping, ...bar_map };

  let arc_mapping = {
    source: "START_STAGE",
    target: "END_STAGE",
    value: "ARTIST_COUNT",
    stroke: "START_STROKE",
  }

  arc_map = { ...arc_mapping, ...arc_map };

  let defaults = {
    selector: '#vis',
    stroke: "black",
    padding: 0,
    margin: { top: 100, right: 20, bottom: 500, left: 20 },
    sort: stages,
    transition: 1000
  }

  options = { ...defaults, ...options };

  let b = barchart(rollup, bar_map, options)
  let a = arcchart(data, arc_map, {...options, opacity: 0}, b.svg)

  return {
    bar: b,
    arc: a,
  }

};