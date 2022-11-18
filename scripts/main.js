// Our bundler automatically creates styling when imported in the main JS file!
import '../styles/main.scss'

// We can use node_modules directely in the browser!
import * as d3 from 'd3';
import { gsap } from "gsap";
import { CSSPlugin } from 'gsap/CSSPlugin';
gsap.registerPlugin(CSSPlugin);

import locations from '../locations.json' assert {type: 'json'};
import { filter, timeMinute } from 'd3';


const daySelector = document.querySelector('#day-select');
const timeSelector = document.querySelector('#time-select');
const sortButton = document.querySelector('#sorting');

const chartWidth = 500;
const chartHeight = 500;

var xScale;

var yScale;
//generate dropdown menu

function fillDropdown() {
    let timesOutput = "";
    let locationsTimes = [];
    // let daysOutput = "";
    // let locationsDays = [];

    //create a array with only the times
    locationsTimes = locations[0].times.map((time) => {
        return time.time;
    });

    //delete duplicate values
    let uniqueTimes = [...new Set(locationsTimes)];

    //push values in options
    uniqueTimes.forEach(time => {
        timesOutput += `<option value="${time}">${time}</option>`;
    });

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
        };
    });
    sortData(filteredData);

    xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.times[0].busy)])
        .range([0, chartWidth]);

    yScale = d3.scaleBand()
        .domain(d3.map(filteredData, d => d.name))
        .range([0, chartHeight])
        .paddingInner(1);

};

function sortData(data) {
    let sortOrder;

    if (sortButton.checked === true) {
        sortOrder = true;
        sortButton.textContent = "Sort busy low to high";
    } else {
        sortOrder = false;
        sortButton.textContent = "Sort busy high to low";
    }

    data = data.sort((a, b) => {
        if (sortOrder === true) {
            return a.times[0].busy - b.times[0].busy;
        } else {
            return b.times[0].busy - a.times[0].busy;
        }

    })
};


//d3 bar chart

function drawChart() {

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

    //dit is voor de closed text   
    d3.select('#bars')
        .selectAll('text')
        .data(filteredData)
        .join('text')
        .attr('height', 50)
        .attr('class', 'barchart__text')
        .attr('y', d => yScale(d.name) + 20)
        .text(d => (d.times[0].busy) <= 0 ? "Closed" : "");
};

function updateChart() {
    d3.select('svg').transition().duration(750);
    d3.select('#bars')
        .selectAll('rect')
        .data(filteredData)
        .join(
            enter => {
                enter
            },
            update => {
                update.each((d, i) => {
                    animateWidth(update.nodes()[i], xScale(d.times[0].busy))
                    return
                });
            })
    d3.select('#bars')
        .selectAll('text')
        .data(filteredData)
        .join('text')
        .text(d => (d.times[0].busy) <= 0 ? "Closed" : "");

    d3.select('#labels')
        .selectAll('text')
        .data(filteredData)
        .join('text')
        .text(d => d.name);
}

//barchart animation
function animateWidth(node, data) {
    gsap.to(node, {
        width: data,
        duration: .3
    })

    gsap.from(node, {
        duration: .3
    })

    return;
}

window.addEventListener('DOMContentLoaded', () => {
    fillDropdown();
    drawChart(filterData("saturdayEvening", "01:00"));
    daySelector.addEventListener("change", () => updateChart(filterData(daySelector.value, timeSelector.value)));
    timeSelector.addEventListener("change", () => updateChart(filterData(daySelector.value, timeSelector.value)));
});

sortButton.addEventListener("change", () => updateChart(filterData(daySelector.value, timeSelector.value)));
// sortButton.addEventListener("change", () => { console.log("change") });





