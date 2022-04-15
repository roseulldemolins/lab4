// csv file to read in
const payGapData = "http://localhost:8000/pay-gap-2017.csv";

// Setting height, width and radius of chart
const width = 600,
  height = 500,
  chartRadius = height / 2 - 40;

// Creating the colour palette
const color = d3
  .scaleOrdinal()
  .range(["#38071C", "#E9C7D6", "#C0B4BE", "#858187"]);

// Applyling the above to the svg
let svg = d3
  .select("#pie_chart")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Creating the tooltip
let tooltip = d3.select("body").append("div").attr("class", "tooltip");

// Uses value of pi
const PI = Math.PI,
  // Sets the minimum radius for the inner arc (greater will create bigger arcs)
  arcMinRadius = 10,
  // Sets the space between each arc
  arcPadding = 10,
  // Moves the labels for the arcs left slightly (so they don't overlap the arc)
  labelPadding = -5,
  // The amount of segments the arc is split into
  numTicks = 10;

// Get list of companies for dropdown (from external top 10 source)
const companies = [
  "GB Group PLC",
  "COMPUTACENTER (UK) LIMITED",
  "Softcat PLC",
  "RENISHAW P L C",
  "RIGHTMOVE GROUP LIMITED",
  "AUTO TRADER LIMITED",
  "Sage (UK) Ltd",
  "AVEVA SOLUTIONS LIMITED",
  "BT FACILITIES SERVICES LIMITED",
  "VODAFONE LIMITED",
];

// Adding the options to the dropdown
d3.select("#selectButton")
  .selectAll("myOptions")
  .data(companies)
  .enter()
  .append("option")
  // Value and label are the same
  .text(function (d) {
    return d;
  })
  .attr("value", function (d) {
    return d;
  }); 

// Domain is set to 100 because it's a percentage
let scale = d3
  .scaleLinear()
  .domain([0, 100])
  // Mapping the range to be the circumference
  .range([0, 2 * PI]);

// This slices the array so the final 100% label isn't shown (as it will overlap with 0%)
let ticks = scale.ticks(numTicks).slice(0, -1);

// Setting the unique keys to be the name of the quartile
const numArcs = 4;

// Calculating the width of an arc, taking into account the number of arcs, the padding, the overall chart radius and
// The minimum radius (of center donut)
const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

// Creating the arc and inner/outer radius so i's a donut
let arc = d3
  .arc()
  .innerRadius((d, i) => getInnerRadius(i))
  .outerRadius((d, i) => getOuterRadius(i))
  .startAngle(0)
  .endAngle((d, i) => scale(d));

  // Converts the radians to degrees
function rad2deg(angle) {
  return (angle * 180) / PI;
}

// Calculates the inner radius
function getInnerRadius(index) {
  return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
}

// Calculates the outer radius
function getOuterRadius(index) {
  return getInnerRadius(index) + arcWidth;
}

// Initial company to be loaded
updatePieChart("GB Group PLC");

// To update the pie chart
function updatePieChart(company) {
  d3.selectAll("path").exit().remove();
  // Reading the csv file
  d3.csv(payGapData).then(function (data) {
    // Here we filter it to the chosen employer
    data = data.filter((line) => line.EmployerName == company);

    // Getting the data in the right format so we convert from one object to an array of object with key value pairs
    const entries = Object.entries(data[0]);

    // Creating the object from the array above
    data = entries.map((line) => {
      return { name: line[0], value: line[1] };
    });

    // This controls the arcs - each item in the array with be an arc
    const columns = [
      "Female Top Quartile",
      "Female Lower Quartile",
      "Female Lower Middle Quartile",
      "Female Upper Middle Quartile",
    ];

    // Now we filter to the above
    data = data.filter((line) => columns.includes(line.name));

    // Reversing the array so the lower quartile is the center
    data = data.reverse();

    // This sets the axis (which is a radius line)
    let radialAxis = svg
      .append("g")
      .attr("class", "r axis")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g");

    // This is the ring axis
    radialAxis
      .append("text")
      .attr("x", labelPadding)
      // Positions one line for each 25%
      .attr("y", (d, i) => -getOuterRadius(i) + arcPadding)
      .text((d) => d.name)
      .style("font-size", "10px")
      .attr("font-family", "sans-serif");

    // Creates the circle shape for each quartile
    radialAxis
      .append("circle")
      .attr("r", (d, i) => getOuterRadius(i) + arcPadding);

    // This is the line axis for each 10%
    let axialAxis = svg
      .append("g")
      .attr("class", "a axis")
      .selectAll("g")
      // Split into the ticks (10)
      .data(ticks)
      .enter()
      .append("g")
      // Rotates the line so they're evenly spaced
      .attr("transform", (d) => "rotate(" + (rad2deg(scale(d)) - 90) + ")");

    // Adds the outer line
    axialAxis.append("line").attr("x2", chartRadius);

    axialAxis
      .append("text")
      .attr("x", chartRadius + 10)
      .style("text-anchor", (d) =>
        // Checks to see if the segment is on the left if it is it will
        // evaulate to null, if it's not it will be "end". This means the
        // labels show always show just outside of the outer circle (if it
        // was one or the other then some would overlap)
        scale(d) >= PI && scale(d) < 2 * PI ? "end" : null
      )
      .attr(
        "transform",
        (d) =>
          "rotate(" +
          (90 - rad2deg(scale(d))) +
          "," +
          (chartRadius + 10) +
          ",0)"
      )
      // Percentage sign to the label
      .text((d) => d + "%");

    //Attaching the data to the arcs
    let arcs = svg
      .append("g")
      .attr("class", "data")
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "arc")
      // Colour is based on theme
      .style("fill", (d, i) => color(i));

      // Adding a transition to it is smooth
    arcs
      .transition()
      // So the quartiles move in turn
      .delay((d, i) => i * 200)
      .duration(1000)
      .attrTween("d", arcTween);

    // Showing/hiding tooltip on mouse event
    arcs.on("mousemove", showTooltip);
    arcs.on("mouseout", hideTooltip);

    // This interpolates between the two angles for the transition
    function arcTween(d, i) {
      let interpolate = d3.interpolate(0, d.value);
      return (t) => arc(interpolate(t), i);
    }

    // Showing the tooltip
    function showTooltip(event, d) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 25 + "px")
        .style("display", "inline-block")
        .html(d.value + "%");
    }

    // Hiding the tooltip
    function hideTooltip() {
      tooltip.style("display", "none");
    }
  });

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function (d) {
    function arcTween(d, i) {
      let interpolate = d3.interpolate(d.value, 0);
      return (t) => arc(interpolate(t), i);
    }

    d3.selectAll("path.arc")
    // Adding a transition when the arcs are removed
      .transition()
      .delay((d, i) => i * 200)
      .duration(1000)
      .attrTween("d", arcTween)
      .remove();
    // Get the option form the dropdown
    var company = d3.select(this).property("value");
    // Run the updateChart function with the choice
    updatePieChart(company);
  });
}
