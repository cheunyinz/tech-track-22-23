// Our bundler automatically creates styling when imported in the main JS file!
import "../styles/main.scss";

// We can use node_modules directely in the browser!
import * as d3 from "d3";
import { create, filter, timeMinute } from "d3";

import { leaflet } from "leaflet";
import * as moment from "moment";

import { gsap } from "gsap";
import { CSSPlugin } from "gsap/CSSPlugin";
gsap.registerPlugin(CSSPlugin);

import locations from "../locations.json" assert { type: "json" };

const daySelector = document.querySelector("#day-select");
const timeSelector = document.querySelector("#time-select");
const sortButton = document.querySelector("#sorting");

const chartDimension = {
  width: 500,
  height: 500,
}


let xScale;
let yScale;


let currentDay = moment().format('dddd');
let currentTime = moment(moment().format('LT'), ["h A"]).format('HH:mm');

let uniqueTimes;
let uniqueDays;

let currentDayFiltered;
let currentTimeFiltered;

function filterCurrentDate(data) {

  createUniqueDays(data);

  //bekijk of de current day bestaat in de array van unieke dagen die ik heb in mijn data set
  if (uniqueDays.indexOf(`${currentDay} Evening`) >= 0) {
    currentDayFiltered = currentDay;
  } else {
    currentDayFiltered = "Friday";
  }

  createUniqueTimes(data);
  //bekijk of de current time bestaat in de array van unieke dagen die ik heb in mijn data set

  if (uniqueTimes.indexOf(currentTime) >= 0) {
    currentTimeFiltered = currentTime;
  } else {
    currentTimeFiltered = "21:00";
  }

}

function createUniqueTimes(data) {
  let locationsTimes = [];

  //create a array with only the times
  locationsTimes = data.times.map((time) => {
    return time.time;
  });

  //delete duplicate values
  uniqueTimes = [...new Set(locationsTimes)];
}


function createUniqueDays(data) {
  let locationsDays = [];

  locationsDays = data.times.map((day) => {
    return day.day;
  });

  uniqueDays = [...new Set(locationsDays)];
}

function fillDropdown(data) {
  let timesOutput;
  let daysOutput;

  createUniqueTimes(data);

  //push values in options
  uniqueTimes.forEach((time) => {
    if (time.slice(0, 2).includes(currentTime.slice(0, 2))) {
      timesOutput += `<option selected="selected" value="${time}">${time}</option>`;
    } else {
      timesOutput += `<option value="${time}">${time}</option>`;
    }
  });

  createUniqueDays(data);

  uniqueDays.forEach((day) => {
    if (day.includes(currentDay)) {
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
  //create a new array with all the location info and only the day and time
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
  //OPSPLITEN IN TWEE APPARTE FUNCTIE .
  xScale = d3
    .scaleLinear()
    .domain([0, d3.max(filteredData, (d) => d.times[0].busy)])
    .range([0, chartDimension.width]);

  yScale = d3
    .scaleBand()
    .domain(d3.map(filteredData, (d) => d.name))
    .range([0, chartDimension.height])
    .paddingInner(1);
}

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

//d3 bar chart

function drawChart(data) {
  console.log("drawChart functie");
  d3.select("#labels")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("y", (d) => {
      return yScale(d.name) + 25;
    })
    .text((d) => d.name);

  d3.select("#bars")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("height", 50)
    .attr("rx", 5)
    .attr("class", "barchart__bar")
    .attr("width", (d) => xScale(d.times[0].busy)) //veranderd de busy per locatie op basis van tijd.
    .attr("y", (d) => yScale(d.name));

  //dit is voor de closed text
  d3.select("#bars")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("height", 50)
    .attr("class", "barchart__text")
    .attr("y", (d) => yScale(d.name) + 20)
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
          animateWidth(update.nodes()[i], xScale(d.times[0].busy));
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

//leaflet

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

// window.addEventListener('DOMContentLoaded', () => {
//     fillDropdown();
//     drawChart(filterData("Saturday Evening", "01:00"));
//     daySelector.addEventListener("change", () => updateChart(filterData(daySelector.value, timeSelector.value)));
//     timeSelector.addEventListener("change", () => updateChart(filterData(daySelector.value, timeSelector.value)));
// });

// sortButton.addEventListener("change", () => { console.log("change") });

window.addEventListener("DOMContentLoaded", () => {
  filterCurrentDate(locations[0]);
  fillDropdown(locations[0]);
  loadData(filterData(`${currentDayFiltered} Evening`, currentTimeFiltered));
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
