// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/main.scss'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';

import locations from '../../locations.json' assert {type: 'json'};

function updateChart(day, time) {
    // day = Number(day);
    const locations = filterData(day, time);
    console.log(day, time);
    console.log(locations);
    drawChart(locations);
}

function filterData(day, time) {
    return locations.filter((d) => d.times[0].day === day, (t) => t.times[0].time === time);
}




function drawChart(locations) {
    const chartWidth = 1000
    const chartHeight = 1000

    const yScale = d3.scaleBand()
        .domain(d3.map(locations, d => d.name))
        .range([0, chartHeight])
        .paddingInner(1);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(locations, d => d.times[0].busy)])
        .range([0, chartWidth])


    d3.select('#labels')
        .selectAll('text')
        .data(locations)
        .join('text')
        .attr('y', d => {
            return yScale(d.name) + 15;
        })
        .text(d => d.name);

    d3.select('#bars')
        .selectAll('rect')
        .data(locations)
        .join('rect')
        .attr('height', 25)
        .attr('class', 'barchart__bar')
        .attr('width', d => xScale(d.times[2].busy)) //veranderd de busy per locatie op basis van tijd.
        .attr('y', d => yScale(d.name));
}


window.addEventListener('DOMContentLoaded', (d, t) => {
    let day = document.querySelector('#day-select');
    let time = document.querySelector('#time-select');

    d3.select(day).on("change", (d) => updateChart(day.value, time.value));
    d3.select(time).on("change", (t) => updateChart(day.value, time.value));
    updateChart("Friday Evening", "21:00");
});