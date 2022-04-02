function scatterPlot() {
  let latestData = "http://localhost:8000/latest-world-poverty.csv";

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 30, bottom: 50, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  var svg = d3
    .select("#scatter_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv(latestData).then(function (data) {
    data = data.filter(
      (country) =>
        country.extreme_poverty != "" ||
        country.total_cases !== "" ||
        country.population !== "" ||
        country.population !== 0 ||
        country.total_deaths !== ""
    );

    // Add X axis
    var x = d3.scaleLinear().domain([0, 0.75]).range([0, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
      svg    
      .append('text')
      // Using height and width to make it easier to change
      .attr('y', height + margin.top + 15)
      .attr('x', width/2)
      .attr('text-anchor', 'end')
      .attr('stroke', 'black')
      .attr('fill', 'black')
      .style('font-family', 'sans-serif')
      .text('Cases / Population')
      

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 80]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));


    var colorScale = d3
      .scaleSequential()
      .domain([0, 1])
      .interpolator(d3.interpolateRdPu);

    // Add a scale for bubble size
    var size = d3
      .scaleLinear()
      .domain([0, 0.01]) // What's in the data
      .range([3, 12]); // Size in pixel

    // Add dots
    var myCircle = svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.total_cases / d.population);
      })
      .attr("cy", function (d) {
        return y(d.extreme_poverty);
      })
      .attr("r", function (d) {
        return size(d.total_deaths / d.population);
      })
      .style("fill", function (d) {
        return colorScale(d.human_development_index);
      })
      .style("opacity", 0.5);

    // Add brushing
    svg.call(
      d3
        .brush()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("start brush", function (event) {
          updateChart(event);
        })
    );

    // This happens when you brush
    function updateChart(event) {
      console.log(event);
      extent = event.selection;
      myCircle.classed("selected", function (d) {
        return isBrushed(extent, x(d.Sepal_Length), y(d.Petal_Length));
      });
    }

    // This returns a boolean depending on if it's within the square - need to work out how to get the data though!
    function isBrushed(brush_coords, cx, cy) {
      var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
      console.log(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1);
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // Checks if it's in the rectangle
    }
  });
}
