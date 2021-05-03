const createD3Map = () => {
	// Set tooltips
	const tip = d3
		.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html((d) => {
			return `<strong>Country: </strong><span class='details'>${
				d.properties.name
			}<br></span>  <strong>Population: </strong><span class='details'> ${d.population.toLocaleString()}</span>
      <img src='${d.properties.flag}' style="width:1vw !important; height: auto" />
      
      `;
		});

	const margin = { top: -250, right: -200, bottom: 0, left: 0 },
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	const color = d3
		.scaleThreshold()
		.domain([
			10000,
			100000,
			500000,
			1000000,
			5000000,
			10000000,
			50000000,
			100000000,
			500000000,
			1500000000,
		])
		.range([
			'rgb(247,251,255)',
			'rgb(222,235,247)',
			'rgb(198,219,239)',
			'rgb(158,202,225)',
			'rgb(107,174,214)',
			'rgb(66,146,198)',
			'rgb(33,113,181)',
			'rgb(8,81,156)',
			'rgb(8,48,107)',
			'rgb(3,19,43)',
		]);

	const path = d3.geoPath();
	const svg = d3
		.select('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('class', 'map');

	const projection = d3
		.geoMercator()
		.scale(130)
		.translate([width / 2, height / 1.5]);
	path.projection(projection);
	svg.call(tip);
	// alpha3Code
	//		.defer(d3.json, 'world_countries.json')
	// 	.defer(d3.json, '/data/countries_data.json')
	queue()
		.defer(d3.json, 'world_countries.json')
		.defer(d3.tsv, 'world_population.tsv')
		.await(ready);

	function ready(error, data, population) {
		// console.log(data);
		const populationById = {};

		population.forEach(function (d) {
			populationById[d.id] = +d.population;
		});
		data.features.forEach(function (d) {
			d.population = populationById[d.id];
		});

		svg
			.append('g')
			.attr('class', 'countries')
			.selectAll('path')
			.data(data.features)
			.enter()
			.append('path')
			.attr('d', path)
			.style('fill', function (d) {
				return color(populationById[d.id]);
			})
			.style('stroke', 'white')
			.style('stroke-width', 1.5)
			.style('opacity', 0.8)
			// tooltips
			.style('stroke', 'white')
			.style('stroke-width', 0.3)
			.on('mouseover', function (d) {
				tip.show(d);

				d3.select(this)
					.style('opacity', 1)
					.style('stroke', 'white')
					.style('stroke-width', 3);
			})
			.on('mouseout', function (d) {
				tip.hide(d);

				d3.select(this)
					.style('opacity', 0.8)
					.style('stroke', 'white')
					.style('stroke-width', 0.3);
			});

		svg
			.append('path')
			.datum(
				topojson.mesh(data.features, function (a, b) {
					return a.id !== b.id;
				}),
			)
			// .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
			.attr('class', 'names')
			.attr('d', path);
	}
}
createD3Map()

