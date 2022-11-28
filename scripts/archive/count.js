const dataSet = [{ "Jaar": 1991, "Aantal": 1 }, { "Jaar": 1992, "Aantal": 0 }, { "Jaar": 1993, "Aantal": 4 }, { "Jaar": 1994, "Aantal": 7 }, { "Jaar": 1995, "Aantal": 4 }, { "Jaar": 1996, "Aantal": 8 }, { "Jaar": 1997, "Aantal": 7 }, { "Jaar": 1998, "Aantal": 6 }, { "Jaar": 1999, "Aantal": 5 }, { "Jaar": 2000, "Aantal": 8 }, { "Jaar": 2001, "Aantal": 2 }, { "Jaar": 2002, "Aantal": 4 }, { "Jaar": 2003, "Aantal": 14 }, { "Jaar": 2004, "Aantal": 6 }, { "Jaar": 2005, "Aantal": 11 }, { "Jaar": 2006, "Aantal": 21 }, { "Jaar": 2007, "Aantal": 12 }, { "Jaar": 2008, "Aantal": 11 }, { "Jaar": 2009, "Aantal": 18 }, { "Jaar": 2010, "Aantal": 16 }, { "Jaar": 2011, "Aantal": 29 }, { "Jaar": 2012, "Aantal": 20 }, { "Jaar": 2013, "Aantal": 30 }, { "Jaar": 2014, "Aantal": 20 }, { "Jaar": 2015, "Aantal": 23 }, { "Jaar": 2016, "Aantal": 13 }, { "Jaar": 2017, "Aantal": 18 }, { "Jaar": 2018, "Aantal": 15 }, { "Jaar": 2019, "Aantal": 11 }, { "Jaar": 2020, "Aantal": 17 }]

const chartDimension.iwdth = 700
const chartHeight = 800

const color = ['red', 'blue', 'green', 'yellow', 'rebeccapurple'];

const xScale = d3.scaleLinear()
	.domain([0, d3.max(dataSet, d => d.Aantal)])
	.range([0, chartDimension.iwdth]);

const yScale = d3.scaleBand()
	.domain(d3.map(dataSet, d => d.Jaar))
	.range([0, chartHeight])
	.paddingInner(0.05);

d3.select('#bars')
	.selectAll('rect')
	.data(dataSet)
	.join('rect')
	.attr('height', 25) //yScale.bandwith())
	.attr('width', d => xScale(d.Aantal))
	.attr('y', d => yScale(d.Jaar))
	.classed('animate__animated animate__headShake animate__infinite', () => Math.random() > 0.8)
	.classed('animate__slower', () => Math.random() > 0.5)

d3.select('#labels')
	.selectAll('text')
	.data(dataSet)
	.join('text')
	.attr('y', d => yScale(d.Jaar) + 15)
	.text(d => d.Jaar);

setInterval(updateData, 6000);
updateData();

function updateData() {
	dataSet.forEach(item => {
		item['Aantal'] = randomNumber(0, 25)
	})

	d3.select('svg').transition().duration(750);

	const t = d3.select('svg').transition()
		.duration(750);

	d3.select('#bars')
		.selectAll('rect')
		.data(dataSet)
		.join(enter => enter
			.text(d => d),
			update => {
				update.each((d, i) => {
					animateWidth(update.nodes()[i], xScale(d.Aantal))

					return;
				})
				// update.attr('width', (d, i) => , i))
			},
			exit => exit
				.attr("fill", "brown")
				.call(exit => exit.transition(t)
					.remove())
		);

}

function animateWidth(node, data) {
	gsap.to(node, {
		width: data,
		fill: color[randomNumber(0, 4)],
		ease: 'elastic',
		duration: 1
	})

	gsap.from(node, {
		rotate: `${randomNumber(-90, 270)}deg`,
		scale: `0.${randomNumber(1, 3)}`,
		duration: 1
	})
	return;
}


function randomNumber(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min)
}