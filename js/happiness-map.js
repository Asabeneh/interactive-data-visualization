const happinessMap = () => {

  const margin = { top: -250, right: -200, bottom: 0, left: 0 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  const svg = d3
  .select('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', 'map');


const g = svg.append('g');

const mercatorProjection = d3.geoMercator()
  .rotate([-10, 0])
  .center([0, 45])
  .scale(140)
  .translate([width/2, height/2]);

const geoPath = d3.geoPath()
    .projection(mercatorProjection);

const color = d3.scaleThreshold()
    .domain([3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5])
    .range(["#045071", "#066792", "#1881AF", "#3993BA", "#5FABCB", "#FFB570", "#FF9E45", "#FF8719", "#E76F00", "#B45600", "#833F00"]);

let happinessReport = {};

d3.queue()
  .defer(d3.json, "../data/countries.geo.json")
  .defer(d3.csv, `../data/world_happiness_report_2017.csv`)
  .await(ready);

function ready(error, world, happiness) {
  if (error) throw error;

  let happinessByCountry = {};
  happiness.forEach(function(d) {
    happinessByCountry[d.Country] = Number(d.Happiness_Score);
  });

  happiness.forEach(function(d) {
    happinessReport[d.Country] = d;
  });

  g.selectAll('path')
    .data(world.features)
    .enter()
    .append('path')
    .attr('fill', '#e8e8e8')
    .attr('d', geoPath)
    .attr("class", "country")
    .style("fill", function(d) {
		  return color(happinessByCountry[d.properties.name]);
    })
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseout", handleMouseOut);
}

let tooltip = d3.select("#map")
                .append("div")
                .attr("class", "tooltip");

tooltip.append("div")
       .attr("class", "country-label");

tooltip.append("div")
       .attr("class", "happiness-rank");

tooltip.append("div")
       .attr("class", "happiness-score");

tooltip.append("div")
       .attr("class", "gdp-per-capita");

// tooltip.append("div")
//        .attr("class", "social-support");

tooltip.append("div")
       .attr("class", "life-expectancy");

// tooltip.append("div")
//        .attr("class", "freedom");

tooltip.append("div")
       .attr("class", "generosity");

// tooltip.append("div")
//        .attr("class", "trust");

function handleMouseOver(d, i) {
  d3.select(this)
    .transition()
    .duration(300)
    .style("stroke", "#FFCF45")
    .style("stroke-width", 2)
    .style("cursor", "pointer");

  tooltip.selectAll("div")
    .html("");

  const countryName = d.properties.name;

  tooltip.select(".country-label")
    .html(countryName);

  if (happinessReport[countryName]) {
    tooltip.select(".happiness-rank")
      .html("Happiness rank: " + happinessReport[countryName].Happiness_Rank);

    tooltip.select(".happiness-score")
      .html("Happiness score: " + happinessReport[countryName].Happiness_Score);

    tooltip.select(".gdp-per-capita")
      .html("GDP per capita: " + happinessReport[countryName].GDP_per_Capita);

    // tooltip.select(".social-support")
    //   .html("Social support: " + happinessReport[countryName].Social_support);

    tooltip.select(".life-expectancy")
      .html("Healthy life expectancy: " + happinessReport[countryName].Healthy_Life_Expectancy);

    // tooltip.select(".freedom")
    //   .html("Freedom to make life choices: " + happinessReport[countryName].Freedom);

    tooltip.select(".generosity")
      .html("Generosity: " + happinessReport[countryName].Generosity);

    // tooltip.select(".trust")
    //   .html("Trust: " + happinessReport[countryName].Trust);
  } else {
    tooltip.select(".happiness-rank")
      .html("Happiness rank: No ranking");
  }

  tooltip
    .transition()
    .duration(500)
    .style("opacity", "1")
    .style("display", "block");
}

function handleMouseOut(d, i) {
  d3.select(this)
    .transition()
    .duration(300)
    .style("stroke", "#c7c7c7")
    .style("stroke-width", 0.5)
    .style("cursor", "normal");

  tooltip
    .transition()
    .duration(500)
    .style("opacity", "0")
    .style("display", "none");
}

function handleMouseMove(d) {
  tooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX + 10) + 'px');
}

const slider = d3.select("#year-slider")
  .on("input", function() {
    updateMap(Number(this.value));
  });

function updateMap(year) {
  const yearSpan = document.getElementById("selected-year");
  yearSpan.innerText = `Year ${year}`;

  d3.queue()
  .defer(d3.csv, `../data/world_happiness_report_${year}.csv`)
  .await(recolorMap);
}

function recolorMap(error, happiness) {
  if (error) throw error;

  let happinessByCountry = {};
  happiness.forEach(function(d) {
    happinessByCountry[d.Country] = Number(d.Happiness_Score);
  });

  happiness.forEach(function(d) {
    happinessReport[d.Country] = d;
  });

  g.selectAll('.country')
    .attr('fill', '#e8e8e8')
    .style("fill", function(d) {
		  return color(happinessByCountry[d.properties.name]);
    });
}

const ticks = d3.scaleLinear()
    .domain([2.5, 8])
    .range([0, 280]);

const xAxis = d3.axisBottom(ticks)
    .tickSize(10)
    .tickValues(color.domain());

const legend = svg.append("g")
  .attr("class", "color-legend")
  .attr("transform", "translate(55, 560)")
  .call(xAxis);

legend.select(".domain")
    .remove();

const legendColors = function(legendColor) {
  let d = color.invertExtent(legendColor);
  if (!d[0]) d[0] = ticks.domain()[0];
  if (!d[1]) d[1] = ticks.domain()[1];
  return d;
};

legend.selectAll("rect")
  .data(color.range().map(legendColor => legendColors(legendColor)))
  .enter().insert("rect", ".legend-tick")
  .attr("height", 10)
  .attr("x", function(d) { return ticks(d[0]); })
  .attr("width", function(d) { return ticks(d[1]) - ticks(d[0]); })
  .attr("fill", function(d) { return color(d[0]); });

legend.append("text")
    .attr("class", "legend-title")
    .attr("fill", "#26272B")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .attr("x", 0)
    .attr("y", -3)
    .text("Happiness Score");
}

