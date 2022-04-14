let jobData = "http://localhost:8000/job_types.csv";



function drawHeatMap(){


// set the dimensions and margins of the graph
const margin = {top: 80, right: 25, bottom: 250, left: 250},
width = 900 - margin.left - margin.right,
height = 650 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#heat_map")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data
d3.csv(jobData).then(function(data) {

  const companies = Array.from(new Set(data.map(d => d.company)))

  console.log('companies', companies)
    // add the options to the button
d3.select("#selectButtonHeatMap")
.selectAll("myOptions")
.data(companies)
.enter()
.append("option")
.text(function (d) {
  return d;
}) // text showed in the menu
.attr("value", function (d) {
  return d;
}); // corresponding value returned by the button
data = data.map((line) => {
  return {
  company: line.company,
  demographic: line.gender + " " + line.race,
  job_category: line.job_category,
  count: line.count
  }
})

// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
const myGroups = Array.from(new Set(data.map(d => d.demographic))).sort().filter(item => !item.includes("otals"))
const myVars = Array.from(new Set(data.map(d => d.job_category))).filter(item => !item.includes("otals"))

// Build X scales and axis:
const x = d3.scaleBand()
.range([ 0, width ])
.domain(myGroups)
.padding(0.05);
svg.append("g")
.style("font-size", 10)
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x).tickSize(0))
// .attr("transform", "rotate(-65)")
// .style("text-anchor", "end")
.select(".domain").remove()

svg.   selectAll("text")
.attr("transform", "rotate(-65)")
.style("text-anchor", "end");

// Build Y scales and axis:
const y = d3.scaleBand()
.range([ height, 0 ])
.domain(myVars)
.padding(0.05);
svg.append("g")
.style("font-size", 15)
.call(d3.axisLeft(y).tickSize(0))
// .select(".domain").remove()

 // Build color scale
 var myColor = 
 // d3.scaleLinear()
 d3.scaleSequential()
 .domain([0, d3.max(data, d => +d.count)])
 // .range(["#e9c7d6", "#38071c"])
 .interpolator(d3.interpolatePuRd);

  // add the squares
  svg.selectAll(".tile")
    .data(data, function(d) {return d.demographic+':'+d.job_category;})
    .enter()
    .append("rect")
    .attr("class", "tile")
      .attr("x", function(d) { return x(d.demographic) })
      .attr("y", function(d) { return y(d.job_category) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.count)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)

    // When the button is changed, run the updateChart function
    d3.select("#selectButtonHeatMap").on("change", function(d) {
            // recover the option that has been chosen
            var company = d3.select(this).property("value")
      // run the updateChart function with this selected option
      updateHeatMap(company, data)
  })

})}

function updateHeatMap(company, data) {

  // Here we filter it to the chosen employer
  data = data.filter((line) => line.company == company && !line.demographic.includes("otals") && !line.job_category.includes("otals"));


       

  // Build color scale
  var myColor = 
  // d3.scaleLinear()
  d3.scaleSequential()
  .domain([0, d3.max(data, d => 
    // console.log(d.count)
    +d.count
    
    )])
  // .range(["#e9c7d6", "#38071c"])
  .interpolator(d3.interpolatePuRd);

  // create a tooltip
  const tooltip = d3.select("#heat_map")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function(event,d) {
    console.log(d.count)
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  const mousemove = function(event,d) {
    tooltip
      .html("The exact value of<br>this cell is: " + d.count)
      .style("left", (event.x)/2 + "px")
      .style("top", (event.y)/2 + "px")
  }
  const mouseleave = function(event,d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  var svg = d3.select("#heat_map")
  // add the squares
  svg
  .selectAll(".tile")

    .data(data, function(d) {return d.demographic+':'+d.job_category;})
    .join("rect")

    .transition()
    .duration(500)
      .style("fill", function(d) { 
        return myColor(d.count)
      })
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  
}
