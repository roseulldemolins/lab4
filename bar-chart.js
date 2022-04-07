let payGapData =  "http://localhost:8000/pay-gap-2017.csv"


// set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#bar_chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initialize the X axis
const x = d3.scaleBand()
  .range([ 0, width ])
  .padding(0.2);
const xAxis = svg.append("g")
  .attr("transform", `translate(0,${height})`);

// Initialize the Y axis
const y = d3.scaleLinear()
  .range([ height, 0]);
const yAxis = svg.append("g")
  .attr("class", "myYaxis");


// A function that create / update the plot for a given variable:
function updateBarChart(gender) {

  // Parse the Data
  d3.csv(payGapData).then( function(data) {


    console.log(data)

    const companies = ["GB Group PLC", "COMPUTACENTER (UK) LIMITED",
      "Softcat PLC",
      "RENISHAW P L C",
      "RIGHTMOVE GROUP LIMITED",
      "AUTO TRADER LIMITED",
      "Sage (UK) Ltd",
      "AVEVA SOLUTIONS LIMITED",
      "BT FACILITIES SERVICES LIMITED",
      "VODAFONE LIMITED"]

      data = data.filter(
        (line) =>
          companies.includes(line.EmployerName)
      );

      console.log(data)

    // X axis
    x.domain(data.map(d => d.EmployerName));
    xAxis.transition().duration(1000).call(d3.axisBottom(x));

    // Add Y axis
    y.domain([0, d3.max(data, d => +d[gender+"TopQuartile"]) ]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // variable u: map data to existing bars
    const u = svg.selectAll("rect")
      .data(data)

    // update bars
    u.join("rect")
      .transition()
      .duration(1000)
        .attr("x", d => x(d.EmployerName))
        .attr("y", d => y(d[gender+"TopQuartile"]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[gender+"TopQuartile"]))
        .attr("fill", "#69b3a2")
  })

}

// Initialize plot
updateBarChart('Male')