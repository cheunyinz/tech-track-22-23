import "../styles/main.scss";

import locations from "../locations.json" assert { type: "json" };

import * as d3 from "d3";
import { create, filter, timeMinute } from "d3";

import { leaflet } from "leaflet";
import moment from 'moment';

import { gsap } from "gsap";
import { CSSPlugin } from "gsap/CSSPlugin";
gsap.registerPlugin(CSSPlugin);

/** GLOBAL VARIABLES */
const daySelector = document.querySelector("#day-select");
const timeSelector = document.querySelector("#time-select");
const sortButton = document.querySelector("#sorting");
const sortText = document.querySelector("#sorting-text-content");

const chartDimension = {
  width: 500,
  height: 500,
}

let scale = {
  x: 0,
  y: 0,
}

let currentDate = {
  day: moment().format('dddd'),
  time: moment(moment().format('LT'), ["h A"]).format('HH:mm')
}

let uniqueDate = {
  day: 0,
  time: 0
}

let currentDateFiltered = {
  day: 0,
  time: 0
}



function filterCurrentDate(data) {

  createUniqueDays(data);
 
  //check if the current day exisist in the array of unique days from my data set. If not the current day will be Friday
  if (uniqueDate.day.indexOf(`${currentDate.day} Evening`) >= 0) {
    currentDateFiltered.day = currentDate.day;
  } else {
    currentDateFiltered.day = "Friday";
  }

  createUniqueTimes(data);

  if (uniqueDate.time.indexOf(currentDate.time) >= 0) {
    currentDateFiltered.time = currentDate.time;
  } else {
    currentDateFiltered.time = "21:00";
  }
}

function createUniqueTimes(data) {
  let locationsTimes = [];

  //create a array with only the times
  locationsTimes = data.times.map((time) => {
    return time.time;
  });

  //delete duplicate times
  uniqueDate.time = [...new Set(locationsTimes)];
}


function createUniqueDays(data) {
  let locationsDays = [];

  locationsDays = data.times.map((day) => {
    return day.day;
  });

  uniqueDate.day = [...new Set(locationsDays)];
}

function fillDropdown(data) {
  let timesOutput;
  let daysOutput;

  createUniqueTimes(data);

  //push the unique dates in the dropdown
  uniqueDate.time.forEach((time) => {

    //if the time is the same as the current time, have that one selected, else not.
    if (time.slice(0, 2).includes(currentDate.time.slice(0, 2))) {
      timesOutput += `<option selected="selected" value="${time}">${time}</option>`;
    } else {
      timesOutput += `<option value="${time}">${time}</option>`;
    }
  });

  createUniqueDays(data);

  uniqueDate.day.forEach((day) => {
    if (day.includes(currentDate.day)) {
      daysOutput += `<option selected="selected" value="${day}">${day}</option>`
    } else {
      daysOutput += `<option value="${day}">${day}</option>`;
    }

  });

  timeSelector.innerHTML = timesOutput;
  daySelector.innerHTML = daysOutput;
}

//filter system
let filteredData = [];

function filterData(d, t) {
  console.log("filterdata functie");

  let dayFilter = d;
  let timeFilter = t;
  //create a new array with all the locations with its information and than only the date information of the selected date.
  filteredData = locations.map((location) => {
    return {
      name: location.name,
      location: location.location,
      placeid: location.placeid,
      urlencodedname: location.urlencodedname,
      coords: { lat: location.coords.lat, long: location.coords.long },
      times: location.times.filter(
        (time) => timeFilter.includes(time.time) && dayFilter.includes(time.day)
      ),
    };
  });
  sortData(filteredData);


  scale.x = d3
    .scaleLinear()
    .domain([0, d3.max(filteredData, (d) => d.times[0].busy)])
    .range([0, chartDimension.width]);

  scale.y = d3
    .scaleBand()
    .domain(d3.map(filteredData, (d) => d.name))
    .range([0, chartDimension.height])
    .paddingInner(1);
}

function sortData(data) {
  let sortOrder;

  if (sortButton.checked === true) {
    sortOrder = true;
    sortText.textContent = "Sort busy low to high";
  } else {
    sortOrder = false;
    sortText.textContent = "Sort busy high to low";
  }

  data = data.sort((a, b) => {
    if (sortOrder === true) {
      return a.times[0].busy - b.times[0].busy;
    } else {
      return b.times[0].busy - a.times[0].busy;
    }
  });
}

function loadData() {
  drawChart(filteredData);
  loadMap(filteredData);
}

function updateData(data) {
  updateChart(data);
  updateMap(data);
}

/** BARCHART */

function drawChart(data) {
  console.log("drawChart functie");
  d3.select("#labels")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("y", (d) => {
      return scale.y(d.name) + 25;
    })
    .text((d) => d.name);

  d3.select("#bars")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("height", 50)
    .attr("rx", 5)
    .attr("class", "barchart__bar")
    .attr("width", (d) => scale.x(d.times[0].busy)) 
    .attr("y", (d) => scale.y(d.name));

 //this is for the "Closed" text
  d3.select("#bars")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("height", 50)
    .attr("class", "barchart__text")
    .attr("y", (d) => scale.y(d.name) + 20)
    .text((d) => (d.times[0].busy <= 0 ? "Closed" : ""));
}

function updateChart(data) {
  console.log("updateChart functie");
  d3.select("svg").transition().duration(750);
  d3.select("#bars")
    .selectAll("rect")
    .data(data)
    .join(
      (enter) => {
        enter;
      },
      (update) => {
        update.each((d, i) => {
          animateWidth(update.nodes()[i], scale.x(d.times[0].busy));
          return;
        });
      }
    );
  d3.select("#bars")
    .selectAll("text")
    .data(data)
    .join("text")
    .text((d) => (d.times[0].busy <= 0 ? "Closed" : ""));

  d3.select("#labels")
    .selectAll("text")
    .attr("height", 50)
    .data(data)
    .join("text")
    .text((d) => d.name);
}

//barchart animation
function animateWidth(node, data) {
  gsap.to(node, {
    width: data,
    duration: 0.3,
  });

  gsap.from(node, {
    duration: 0.3,
  });

  return;
}

/**LEAFLET MAP */

let map;

function loadMap(data) {
  console.log("load map");

  map = L.map("map").setView([52.3661034287496, 4.8964865409214715], 18);

  L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }
  ).addTo(map);

  addMarkers(data);
}

function updateMap(data) {
  console.log("update map");

  map.remove();
  loadMap(data);
};

function addMarkers(data) {
  console.log("add marker");

  data.forEach((location) => {
    console.log(location.times[0].busy);
    let icon;

    //give the markers a certain color based on how busy it is
    if (location.times[0].busy === 0) {
      icon = L.divIcon({
        html: "<i></i>",
        className: "animated-icon animated-icon--empty",
      });
    } else if (location.times[0].busy < 25) {
      icon = L.divIcon({
        html: "<i></i>",
        className: "animated-icon animated-icon--low",
      });
    } else if (location.times[0].busy < 75) {
      icon = L.divIcon({
        html: "<i></i>",
        className: "animated-icon animated-icon--medium",
      });
    } else {
      icon = L.divIcon({
        html: "<i></i>",
        className: "animated-icon animated-icon--high ",
      });
    };

    L.marker([location.coords.lat, location.coords.long], { icon: icon })
      .addTo(map)
      .bindPopup(
        `${location.name} <a href="https://www.google.com/maps/dir/?api=1&destination=${location.urlencodedname}&destination_place_id=${location.placeid}" target="_blank"> Take me to this location</a>`
      );
  });
};

window.addEventListener("DOMContentLoaded", () => {
  filterCurrentDate(locations[0]);
  fillDropdown(locations[0]);
  loadData(filterData(`${currentDateFiltered.day} Evening`, currentDateFiltered.time));
});

daySelector.addEventListener("change", () => {
  filterData(daySelector.value, timeSelector.value);
  updateData(filteredData);
});
timeSelector.addEventListener("change", () => {
  filterData(daySelector.value, timeSelector.value);
  updateData(filteredData)
});

sortButton.addEventListener("change", () => {
  filterData(daySelector.value, timeSelector.value);
  updateChart(filteredData);
}
);
