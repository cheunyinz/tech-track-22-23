function updateChart(weekNumber) {
	weekNumber = Number(weekNumber);
	const dataSet = filterData(weekNumber);
	drawChart(dataSet);
}

function filterData(weekNumber) {

	const dataSet = [
		{ week: 1, day: "Monday", cars: 10 },
		{ week: 1, day: "Tuesday", cars: 50 },
		{ week: 1, day: "Wednesday", cars: 80 },
		{ week: 1, day: "Thursday", cars: 150 },
		{ week: 2, day: "Monday", cars: 300 },
		{ week: 2, day: "Tuesday", cars: 200 },
		{ week: 2, day: "Wednesday", cars: 150 },
		{ week: 2, day: "Thursday", cars: 73 },
		{ week: 2, day: "Friday", cars: 130 },
		{ week: 2, day: "Saturday", cars: 25 },
		{ week: 2, day: "Sunday", cars: 10 }
	];

	return dataSet.filter((d) => d.week === weekNumber);
}

function drawChart(dataSet) {
	const pointScale = d3
		.scalePoint()
		.domain(d3.map(dataSet, (d) => d.day))
		.range([0, 700]);

	const sqrtScale = d3
		.scaleSqrt()
		.domain(d3.extent(dataSet, (d) => d.cars))
		.range([1, 30]);

	const colorScaleLinear = d3
		.scaleLinear()
		.domain(d3.extent(dataSet, (d) => d.cars))
		.range(["red", "darkred"]);

	d3.select("#scale1")
		.selectAll("circle")
		.data(dataSet)
		.join("circle")
		.transition()
		.duration(500)
		.attr("r", (d) => sqrtScale(d.cars))
		.attr("cx", (d) => pointScale(d.day))
		.attr("fill", (d) => colorScaleLinear(d.cars));

	const axisBottom = d3.axisBottom(pointScale).tickFormat((s) => s.slice(0, 2));

	d3.select("#axis1").call(axisBottom);
}

window.addEventListener('DOMContentLoaded', (e) => {
	d3.selectAll("button").on("click", (e) => updateChart(e.target.value));
	updateChart(0);
});