// File that includes all the covid vaccinations based on country
let worldData = "http://localhost:8000/world.topojson";
let latestData = "http://localhost:8000/latest-world.csv";

// Setting the size and margins of the graph
var margin = { top: 50, right: 30, bottom: 30, left: 100 },
  width = 900 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
// The svg
const svg = d3
  .select("#map_svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Map and projection
const path = d3.geoPath();
const projection = d3
  .geoMercator()
  .scale(90)
  .center([0, 20])
  .translate([width / 2, height / 2 ]);
// Data and color scale
const data = new Map();
const purpleColorScale = d3
  .scaleThreshold()
  .domain([0, 100000, 1000000, 3000000, 10000000, 800000000])
  .range(d3.schemePurples[7]);

// Data and color scale
const redColorScale = d3
  .scaleThreshold()
  .domain([0, 10000, 100000, 300000, 1000000, 1000000])
  .range(d3.schemeReds[7]);

// Add a scale for bubble size
var size = d3
  .scaleLinear()
  .domain([0, 100000, 1000000, 3000000, 10000000, 800000000]) // What's in the data
  .range([2, 3, 4, 5, 6, 7, 8]); // Size in pixel

// Here we create a div for the tooltip with styling
var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("opacity", 0);

// Load external data and boot
Promise.all([
  d3.json(worldData),
  d3.csv(latestData, function (d) {
    data.set(d.iso_code, {
      population: +d.population,
      total_cases: +d.total_cases,
      total_deaths: +d.total_deaths,
    });
  }),
]).then(function (loadData) {
  let topo = loadData[0];

  let mouseOver = function (event, d) {
    if (data.get(d.id) == undefined) {
      data.set(d.id, {
        population: 0,
        total_cases: 0,
        total_deaths: 0,
      });
    }
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", 0.5)
      .style("stroke", "transparent");
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black");

    // Getting the x and y coordinates from the event
    const x = d3.pointer(event)[0];
    const y = d3.pointer(event)[1];
    tooltip
      // Adds a transiiton to make it smooth
      .transition()
      .duration(300)
      // Setting opacity so it's it shown
      .style("opacity", 0.9)
      .style("stroke", "black")
      // Adding position
      .style("left", x + "px")
      .style("top", y + "px");
    // Setting the inner html to be the id
    tooltip.html(
      "<strong>Country: </strong><span class='details'>" +
        d.properties.name +
        "<br></span>" +
        "<strong>Population: </strong><span class='details'>" +
        data.get(d.id).population +
        "<br></span>" +
        "<strong>Total Cases: </strong><span class='details'>" +
        data.get(d.id).total_cases +
        "<br></span>" +
        "<strong>Total Deaths: </strong><span class='details'>" +
        data.get(d.id).total_deaths +
        "<br></span>"
    );
  };

  let mouseLeave = function (d) {
    tooltip.style("opacity", 0);
    d3.selectAll(".Country").transition().duration(200).style("opacity", 0.8);
    d3.select(this).transition().duration(200).style("stroke", "transparent");
  };

  const mouseClick = function (d) {
    stackedBar(d.target.__data__.properties.name);
  };

  let feature = svg.selectAll(".path").data(topo.features).enter().append("g");

  // Draw the map
  feature
    .append("path")
    // draw each country
    .attr("d", d3.geoPath().projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      return purpleColorScale(
        data.get(d.id) ? data.get(d.id).total_cases : "white"
      );
    })
    .style("stroke", "transparent")
    .attr("class", function (d) {
      return "Country";
    })
    .style("opacity", 0.8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
    .on("click", function (d) {
      mouseClick(d);
    });

  var centroids = topo.features.map(function (feature) {
    return path.centroid(feature);
  });

  feature
    .selectAll(".centroid")
    .data(topo.features)
    .enter()
    .append("circle")
    .attr("class", "centroid")
    .attr("fill", function (d) {
      return redColorScale(
        data.get(d.id) ? data.get(d.id).total_deaths : "white"
      );
    })
    .attr("r", function (d) {
      return data.get(d.id) ? size(data.get(d.id).total_cases) : 0;
    })
    .attr("cx", function (d) {
      return projection(path.centroid(d))[0];
    })
    .attr("cy", function (d) {
      return projection(path.centroid(d))[1];
    });
});
