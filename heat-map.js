// CSV file to read in
let jobData = "http://localhost:8000/job_types.csv";


var companyData

// Function to draw overall heatmap
function drawHeatMap() {
  // Setting the dimensions and margins of the graph
  const margin = { top: 40, right: 25, bottom: 300, left: 240 },
    width = 900 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

  // Selecting the svg object and applying dimencions
  var svg = d3
    .select("#heat_map")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Read the data
  d3.csv(jobData).then(function (data) {
    // Make a set of all the comapnies to choose from
    const companies = Array.from(new Set(data.map((d) => d.company)));

    //  Add these companies to the dropdown
    d3.select("#selectButtonHeatMap")
      .selectAll("myOptions")
      .data(companies)
      .enter()
      .append("option")
      // Label in menu is the same as the value
      .text(function (d) {
        return d;
      })
      .attr("value", function (d) {
        return d;
      });

    // Maps the data
    data = data.map((line) => {
      return {
        company: line.company,
        // Concatenating the gender and race
        demographic: line.gender + " " + line.race,
        job_category: line.job_category,
        count: line.count,
      };
    });

    // Creates a set of the groups so they're unique
    const myGroups = Array.from(new Set(data.map((d) => d.demographic)))
      // Arranging them alphabetically
      .sort()
      // Removing the total columns
      .filter((item) => !item.includes("otals"));
    // Creating a set of all of the job types
    const myVars = Array.from(new Set(data.map((d) => d.job_category))).filter(
      // Filtering out totals again
      (item) => !item.includes("otals")
    );

    // Creating X scales and axis
    const x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.05);

    // Adding titles to heatmap
    svg
      .append("g")
      .style("font-size", 10)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select(".domain")
      .remove();

    // Rotating them so they fit better
    svg
      .selectAll("text")
      .attr("transform", "rotate(-65)")
      .style("text-anchor", "end");

    // Creating Y axis and scale
    const y = d3.scaleBand().range([height, 0]).domain(myVars).padding(0.05);
    // Adding the labels for job types
    svg.append("g").style("font-size", 15).call(d3.axisLeft(y).tickSize(0));

    // Build color scale
    var myColor = d3
      .scaleSequential()
      // Sets the max to be for this partivular company
      .domain([0, d3.max(data, (d) => +d.count)])
      .interpolator(d3.interpolatePuRd);

    // Adding the squares
    svg
      .selectAll(".tile")
      // Unique name
      .data(data, function (d) {
        return d.demographic + ":" + d.job_category;
      })
      .enter()
      .append("rect")
      .attr("class", "tile")
      // X coord based on demographic
      .attr("x", function (d) {
        return x(d.demographic);
      })
      // Y coord based on job type
      .attr("y", function (d) {
        return y(d.job_category);
      })
      // Rounding corners off
      .attr("rx", 4)
      .attr("ry", 4)
      // Evenly sizes for x and y
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        // Colour is based on volume of people
        return myColor(d.count);
      })
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8);

    // When the button is changed, run the updateChart function
    d3.select("#selectButtonHeatMap").on("change", function (d) {
      // Get the option chosen by the user
      var company = d3.select(this).property("value");

      // Call update chart function with this comapny
      updateHeatMap(company);
    });
  });
}

// Just to update colour rather than redraw
function updateHeatMap(company) {
  console.log(company)
//Read the data
d3.csv(jobData).then(function (data) {

      // Make a set of all the comapnies to choose from
      const companies = Array.from(new Set(data.map((d) => d.company)));

      if (companies.includes(company)){
  console.log(data)
  // Maps the data
  data = data.map((line) => {
    return {
      company: line.company,
      // Concatenating the gender and race
      demographic: line.gender + " " + line.race,
      job_category: line.job_category,
      count: line.count,
    };
  });
  // Adding a tooltip which won't be visible yet
  var tooltip = d3
    .select("#heat_map_div")
    .append("div")
    .attr("class", "tooltip")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("opacity", 0);

  // Here we filter it to the chosen employer
  data = data.filter(
    (line) =>
      line.company == company &&
      !line.demographic.includes("otals") &&
      !line.job_category.includes("otals")
  );

  // Build color scale again so it's relevant to this data
  var myColor = d3
    .scaleSequential()
    .domain([0, d3.max(data, (d) => +d.count)])
    .interpolator(d3.interpolatePuRd);

  // Shows the tooltip and sets the content when the mouse moves over a tile
  const mouseover = function (event, d) {
    tooltip.style("opacity", 1).html("There are " + d.count + " people.");
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };

  // Moves the tooltip with the mouse
  const mousemove = function (event, d) {
    tooltip
      .style("left", event.x - 100 + "px")
      .style("top", event.y + 100 + "px");
  };

  // Hides teh tooltip when the mouse leaves
  const mouseleave = function (event, d) {
    tooltip.style("opacity", 0);
    d3.select(this).style("stroke", "none").style("opacity", 0.8);
  };

  var svg = d3.select("#heat_map");
  // Adding in the tiles
  svg
    .selectAll(".tile")
    // Attaching the data
    .data(data, function (d) {
      return d.demographic + ":" + d.job_category;
    })
    .join("rect")
    // Adding mouse listeners
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    // Adding the transition to next colour
    .transition()
    .duration(500)
    .style("fill", function (d) {
      return myColor(d.count);
    })
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8);
}})}
