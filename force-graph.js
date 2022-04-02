function forceGraph() {
  let latestData = "http://localhost:8000/latest-world-force.csv";

  var width = 1200,
    height = 500;
  // setup svg
  var svg = d3.select("#force_svg").attr("width", width).attr("height", height);

  // Add a scale for bubble size
  var size = d3
    .scaleLinear()
    .domain([0, 1000, 5000, 20000]) // What's in the data
    .range([6, 12, 18, 24]); // Size in pixel

  // Reading in the data from a .json file
  // This returns a promise so we use .then
  d3.csv(latestData).then(function (data) {
    data = data.filter(
      (country) =>
        country.total_deaths_per_million !== "" &&
        country.extreme_poverty !== "" &&
        country.total_cases_per_million !== ""
    );

    var colorScale = d3
      .scaleSequential()
      .domain([-70, 100])
      .interpolator(d3.interpolatePuRd);

    // Sets the simulation
    var simulation = d3
      // This sets the simulation to be on the nodes data
      .forceSimulation(data)
      // This attracts the nodes to one another because it's positive, the strength can be controlled where
      // weve used 5
      // .force('charge', d3.forceManyBody().strength(5))
      // This forces the nodes to attract to a particular position.
      // Here we are using a calculate based on the group to force the
      // nodes towards a particular x position
      .force(
        "x",
        d3.forceX().x(function (d) {
          return d.total_cases_per_million / 1000 + 100;
        })
      )
      // This forces the nodes to attract to a particular position.
      // Here we are using a calculate based on the length of the id to force the
      // nodes towards a particular y position
      .force(
        "y",
        d3.forceY().y(function (d) {
          return d.total_deaths_per_million / 50 + 100;
        })
      )
      // This stops the nodes from overlapping, which is why we pass the radius in which is pop dens.
      .force(
        "collision",
        d3.forceCollide().radius(function (d) {
          return size(d.population_density);
        })
      )
      // Callback function to update the nodes positions
      .on("tick", ticked);

    let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("opacity", 0);

    // This is the function called to update the nodes
    function ticked() {
      var u = svg
        .selectAll("circle")
        .data(data)
        .join("circle")
        // Changes the colour based on the group
        .attr("fill", function (d) {
          return colorScale(d.extreme_poverty);
        })
        // Applies the radius
        .attr("r", function (d) {
          return size(d.population_density);
        })
        // Sets the x and y coordinates
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        })
        .attr("class", function (d) {
          return d.continent.substring(0, 2);
        })
        // Event listener on mouse over
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              "<strong>Country: </strong><span class='details'>" +
                d.location +
                "<br></span>" +
                "<strong>Total cases per million: </strong><span class='details'>" +
                d.total_cases_per_million +
                "<br></span>" +
                "<strong>Total deaths per million: </strong><span class='details'>" +
                d.total_deaths_per_million +
                "<br></span>" +
                "<strong>Population density: </strong><span class='details'>" +
                d.population_density +
                "<br></span>" +
                "<strong>% living in extreme poverty: </strong><span class='details'>" +
                d.extreme_poverty +
                "<br></span>"
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
          d3.select(this)
            // Setting a border
            .style("stroke", "black")
            .style("stroke-width", "3px")
            // This makes the colour fill a bit more vibrant formt he colour scheme
            .attr("fill", function (d) {
              return colorScale(d.extreme_poverty + 20);
            });
        })
        // Event listener on mouse out
        .on("mouseout", function (event, d) {
          tooltip.transition().duration(500).style("opacity", 0);
          svg
            .selectAll(".tooltip")
            .transition()
            .duration(500)
            .style("opacity", 0);
          d3.select(this)
            // Sets the fill back to what it was
            .attr("fill", function (d) {
              return colorScale(d.extreme_poverty);
            })
            // Removes border
            .style("stroke", "none");
        })

        .call(
          d3
            .drag() // call specific function when circle is dragged
            .on("start", dragstarted) // This will get called when a user starts to drag
            .on("drag", dragged) // This will get called whilst the user is dragging
            .on("end", dragended) // This will get called when the user stops dragging
        );

      // This is what happens when the drag starts
      function dragstarted(event, d) {
        // This will start up the simulation if an active drag isn't occurring
        if (!event.active) simulation.alphaTarget(0.03).restart();
        // Here we set the fixed positions to be the current x and y coordinates
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event, d) {
        // Here we set the fixed positions to be the current x and y coordinates
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event, d) {
        // Here we don't want to the simulation to end if there was already a drag occuring
        if (!event.active) simulation.alphaTarget(0.03);
        // These are set as null so the nodes are free to move
        d.fx = null;
        d.fy = null;
      }
    }
  });
}
