function scatterVaccPlot() {
  let latestData = "http://localhost:8000/full-data-new-vaccines.csv";

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 30, bottom: 50, left: 100 },
    width = 460 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#scatter_vacc_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv(latestData).then(function (data) {
    data = data.filter(
      (country) =>
        country.continent != "" &&
        country.new_cases != "" &&
        country.new_vaccinations != ""
    );

    // Add X axis
    var x = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return +d.total_deaths;
        })
      )
      .range([0, width]);

  

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return +d.new_vaccinations;
        })
      )
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));
    svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(6))
    svg 
    .append('text')
    // Using height and width to make it easier to change
    .attr('y', height + margin.top + 15)
    .attr('x', width/2)
    .attr('text-anchor', 'end')
    .attr('stroke', 'black')
    .attr('fill', 'black')
    .style('font-family', 'sans-serif')
    .text('Total deaths')


    var colorScale = d3
      .scaleSequential()
      .domain(
        d3.extent(data, function (d) {
          return data.total_vaccinations;
        })
      )
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
        return x(d.new_cases);
      })
      .attr("cy", function (d) {
        return y(d.new_vaccinations);
      })
      .attr("r", function (d) {
        return 3;
      })
      .style("fill", "purple")
      .style("opacity", 0.5);

    // Add brushing
    svg.call(
      d3
        .brush() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [width, height],
        ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("start brush", function (event) {
          updateChart(event);
        }) // Each time the brush selection changes, trigger the 'updateChart' function
    );

    // Function that is triggered when brushing is performed
    function updateChart(event) {
      extent = event.selection;
      myCircle.classed("selected", function (d) {
        return isBrushed(extent, x(d.Sepal_Length), y(d.Petal_Length));
      });
    }

    // A function that return TRUE or FALSE according if a dot is in the selection or not
    function isBrushed(brush_coords, cx, cy) {
      var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
    }
  });
}
