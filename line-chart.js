function lineChart(chosenCountry) {
  let latestData = "http://localhost:8000/full-data-reproduction.csv";

  // set the dimensions and margins of the graph
  const margin = { top: 50, right: 30, bottom: 50, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#line_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //Read the data
  d3.csv(latestData).then(function (data) {
    data = data.filter(
      // Filtering to 2021 and no continent masses
      (country) => country.date.includes("2021") && country.continent !== "" && country !== "" && country.reproduction_rate !== ""
    );

    // This creates a map of the data by using rollup
    const sumstat = d3.rollup(
      data,
      // Reduces the reproduction rate to be the mean of all of them
      (v) => d3.mean(v, (d) => d.reproduction_rate),
      // Keeps the continent and date info
      (d) => d.continent,
      (d) => d.date
    );

    // Adding the x axis
    const x = d3
      .scaleTime()
      .domain(
        // Extent get's min and max so it's scaled
        d3.extent(data, function (d) {
          // It's a date!
          return d3.timeParse("%Y-%m-%d")(d.date);
        })
      )
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(8));
   
      svg
      .selectAll("text")
      .attr("transform", "rotate(-65)")
      .style("text-anchor", "end");
      
      svg    
      .append('text')
      // Using height and width to make it easier to change
      .attr('y', height + margin.top)
      .attr('x', width/2)
      .attr('text-anchor', 'end')
      .attr('stroke', 'black')
      .style('font-family', 'sans-serif')
      .text('Month')

    // Adding a y axis
    const y = d3.scaleLinear().domain([0, 1.6]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Creating the colour palette
    const color = d3
      .scaleOrdinal()
      .range([
        "#d60202",
        "#a248cf",
        "#ed9fda",
        "#5e0551",
        "#5e0517",
        "#de284d",
      ]);

    // Adding a tooltip (not visible yet)
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("opacity", 0);

    // Draws the line
    svg
      .selectAll(".line")
      .data(sumstat)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function (d) {
        // Using a nice colour palette
        return color(d[0]);
      })
      .attr("stroke-width", 2)
      .attr("d", function (d) {
        return d3
          .line()
          .x(function (d) {
            // We need to use thuis so it's a date object
            return x(d3.timeParse("%Y-%m-%d")(d[0]));
          })
          .y(function (d) {
            return y(d[1]);
          })(d[1]);
      })
      .on("mouseover", function (event, d) {
        // Selects all the circles with the classname of the first 2 letters of continent
        const circles = d3.selectAll(`.${d[0].substring(0, 2)}`);
        // Gives them a black outline
        circles.style("stroke", "black").style("stroke-width", "2px");
        // Adds a transition to make it look nice
        tooltip.transition().duration(200).style("opacity", 0.9);
        // Setting content in tooltip
        tooltip
          .html(
            "<strong>Continent: </strong><span class='details'>" +
              d[0] +
              "<br></span>"
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        // Remove the outlines on all circles
        d3.selectAll("circle").style("stroke", "none");
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .on("click", function (event, d) {
        // Get rid of the pie chart and redraw for that continents data
        removePieChart(d[0]);
      });
  });
}
