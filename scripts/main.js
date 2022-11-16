// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/main.scss'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';
import { gsap } from "gsap";

import locations from '../locations.json' assert {type: 'json'};
import { filter, timeMinute } from 'd3';


const daySelector = document.querySelector('#day-select');
const timeSelector = document.querySelector('#time-select');

//generate dropdown menu

function fillDropdown() {
    let timesOutput = "";
    let locationsTimes = [];
    // let daysOutput = "";
    // let locationsDays = [];

    //create a array with only the times
    locationsTimes = locations[0].times.map((time) => {
        return time.time;
    })

    //delete duplicate values
    let uniqueTimes = [...new Set(locationsTimes)];

    //push values in options
    uniqueTimes.forEach(time => {
        timesOutput += `<option value="${time}">${time}</option>`;
    })

    // locationsDays = locations[0].times.map((day) => {
    //     return day.day;
    // })


    // let uniqueDays = [...new Set(locationsDays)];

    // uniqueDays.forEach(day => {
    //     daysOutput += `<option value="${day}">${day}</option>`;
    // })


    timeSelector.innerHTML = timesOutput;
    // daySelector.innerHTML = daysOutput
};


//filter system
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
    sortData(filteredData);
};


function sortData(data) {
    data = data.sort((a, b) => {
        return a.times[0].busy - b.times[0].busy;
    })
}


//d3 bar chart

function drawChart() {
    const chartWidth = 600
    const chartHeight = 500

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
            return yScale(d.name) + 25;
        })
        .text(d => d.name);

    d3.select('#bars')
        .selectAll('rect')
        .data(filteredData)
        .join('rect')
        .attr('height', 50)
        .attr('rx', 5)
        .attr('class', 'barchart__bar')
        .attr('width', d => xScale(d.times[0].busy)) //veranderd de busy per locatie op basis van tijd.
        .attr('y', d => yScale(d.name));

    d3.select('#bars')
        .selectAll('text')
        .data(filteredData)
        .join('text')
        .attr('height', 50)
        .attr('class', 'barchart__text')
        .attr('y', d => yScale(d.name) + 20)
        .text(d => (d.times[0].busy) <= 0 ? "Closed" : "");
}

gsap.from(".bartchart__bars rect", {
    stagger: 0.3,
    rotate: '360deg',
    scale: 1.5,
    repeat: -1,
    duration: 1
})




window.addEventListener('DOMContentLoaded', (d, t) => {
    fillDropdown();
    daySelector.addEventListener("change", (d) => drawChart(filterData(daySelector.value, timeSelector.value)));
    timeSelector.addEventListener("change", (t) => drawChart(filterData(daySelector.value, timeSelector.value)));
    drawChart(filterData());
});



