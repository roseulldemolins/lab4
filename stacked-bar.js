let diversityData = "http://localhost:8000/testing.csv";
let companyData = "http://localhost:8000/category-brands-2.csv";

function drawStackedChart(){

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 75, left: 50},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#stacked_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
Promise.all([
  d3.csv(diversityData),
  d3.csv(companyData)])
  .then ( function(data) {

    console.log(data)

  let diversityData = data[0]
  let companyData = data[1]

  const companies = companyData.map(d => d.name)

  console.log(companies)

  // List of subgroups = header of the csv files = soil condition here
  const subgroups = diversityData.columns.slice(6,13)

  console.log(subgroups)

  diversityData = diversityData.filter(
    (line) =>
      line.year == "2018" &&
      companies.includes(line.Company)
  );



  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = diversityData.map(d => d.Company)

  // Add X axis
  const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));
  
    svg
      .selectAll("text")
      .attr("transform", "rotate(-65)")
      .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));


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

  //stack the data? --> stack per subgroup
  const stackedData = d3.stack()
    .keys(subgroups)
    (diversityData)

    console.log(stackedData, subgroups)

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => d)
      .join("rect")
        .attr("x", d => 
      // console.log(d.data.Company)
        x(d.data.Company)
        )
      
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width",x.bandwidth())
})
}
