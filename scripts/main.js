// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/main.scss'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';
import { gsap } from "gsap";

import locations from '../locations.json' assert {type: 'json'};
import { filter } from 'd3';


let filteredData = [];

function filterData(d, t) {
    let dayFilter = d;
    let timeFilter = t;

    filteredData = locations.map((location) => {
        return {
            name: location.name,
            location: location.location,
            coords: { lat: location.coords.lat, long: location.coords.long },
            times: location.times.filter(time => (timeFilter.includes(time.time) && dayFilter.includes(time.day)))
        }
    })

    console.log(filteredData);

};


function drawChart() {
    const chartWidth = 800
    const chartHeight = 800

    const yScale = d3.scaleBand()
        .domain(d3.map(filteredData, d => d.name))
        .range([0, chartHeight])
        .paddingInner(1);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.times[0].busy)])
        .range([0, chartWidth])


    d3.select('#labels')
        .selectAll('text')
        .data(filteredData)
        .join('text')
        .attr('y', d => {
            return yScale(d.name) + 15;
        })
        .text(d => d.name);

    d3.select('#bars')
        .selectAll('rect')
        .data(filteredData)
        .join('rect')
        .attr('height', 25)
        .attr('class', 'barchart__bar')
        .attr('width', d => xScale(d.times[0].busy)) //veranderd de busy per locatie op basis van tijd.
        .attr('y', d => yScale(d.name));

    d3.select('#bars')
        .selectAll('text')
        .data(filteredData)
        .join('text')
        .attr('height', 25)
        .attr('class', 'barchart__text')
        .attr('y', d => yScale(d.name) + 15)
        .text(d => (d.times[0].busy) <= 0 ? "Closed" : "");
}


window.addEventListener('DOMContentLoaded', (d, t) => {
    let daySelector = document.querySelector('#day-select');
    let timeSelector = document.querySelector('#time-select');

    daySelector.addEventListener("change", (d) => drawChart(filterData(daySelector.value, timeSelector.value)));
    timeSelector.addEventListener("change", (t) => drawChart(filterData(daySelector.value, timeSelector.value)));
    drawChart(filterData());
});



