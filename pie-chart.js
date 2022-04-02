function removePieChart(country) {
  d3.select("#pie_chart_svg").selectAll("*").remove();
  pieChart(country);
}

function pieChart(chosenContinent) {
  // File that includes all the covid vaccinations based on country
  let latest = "http://localhost:8000/latest-world-deaths.csv";

  // Setting the size and margins of the graph
  var margin = { top: 250, right: 30, bottom: 30, left: 250 },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // Adding an svg to the page, and applying the dimensions above
  var svg = d3
    .select("#pie_chart_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv(latest).then(function (data) {
    if (chosenContinent !== "All") {
      data = data.filter((country) => country.continent == chosenContinent);
    } else {
      data = data.filter((country) => country.continent !== "");
    }
    var width = 400,
      height = 400,
      radius = Math.min(width, height) / 2;

    // Compute the position of each group on the pie:
    const pie = d3.pie().value(function (d) {
      return d.total_deaths;
    });
    const data_ready = pie(data);

    var arc = d3
      .arc()
      .innerRadius(radius - 100)
      .outerRadius(radius - 20);

    // set the color scale
    const color = d3
      .scaleSequential()
      .domain([1, data.length])
      .interpolator(d3.interpolatePuRd);

    // shape helper to build arcs:
    const arcGenerator = d3.arc().innerRadius(50).outerRadius(radius);

    // Here we create a div for the tooltip with styling
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("opacity", 0);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll("mySlices")
      .data(data_ready)
      .join("path")
      .attr("d", arcGenerator)
      .attr("fill", function (d, i) {
        return color(i);
      })
      .attr("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", 1)
      .on("mouseover", function (event, d) {
        console.log(d);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            "<strong>Country: </strong><span class='details'>" +
              d.data.location +
              "<br></span>" +
              "<strong>Total Deaths: </strong><span class='details'>" +
              +d.data.total_deaths +
              "<br></span>"
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .on("click", function (event, d) {
        removeLineChart(d.data.location);
      })
      // Sets a transition for 1 second
      .transition()
      .duration(1000)
      // Calculating start and end angles
      .attrTween("d", function (d) {
        var i = d3.interpolate(d.endAngle, d.startAngle);
        return function (t) {
          d.startAngle = i(t);
          return arc(d);
        };
      });
  });
}
