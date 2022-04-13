let diversityData = "http://localhost:8000/testing.csv";
let companyData = "http://localhost:8000/category-brands-2.csv";

function drawStackedChart() {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 85, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#stacked_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Parse the Data
  Promise.all([d3.csv(diversityData), d3.csv(companyData)]).then(function (
    data
  ) {


    let diversityData = data[0];
    let companyData = data[1];

    const companies = companyData.filter((line) => line.date.includes("2018"));

    const columns = diversityData.columns;

    const companyNames = companies.map((line) => line.name);

    diversityData = diversityData.filter(
      (line) => line.year == "2018" && companyNames.includes(line.Company)
    );

    diversityData.forEach((d) => {
      d.earnings = getProfit(d.Company);
    });

    function getProfit(company) {
      return companies.filter((line) => {
        return line.name == company;
      })[0].value;
    }

    // List of subgroups = header of the csv files = soil condition here
    const subgroups = columns.slice(6, 13);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = diversityData.map((d) => d.Company);

    // Add X axis
    const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg
      .selectAll("text")
      .attr("transform", "rotate(-65)")
      .style("text-anchor", "end");


  // text label for the x axis
  svg.append("text")             
  .attr("transform",
        "translate(" + (width/2) + " ," + 
                       (height + margin.top + 70) + ")")
  .style("text-anchor", "middle")
  .text("Technology/Social Media Company");


    // Add Y axis
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

      // text label for the y axis
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("% of Ethnicity");  

    // Creating the colour palette
    const color = d3
      .scaleOrdinal()
      .range([
        "#38071C",
        "#E9C7D6",
        "#C0B4BE",
        "#858187",
        "#7B757D",
        "#544A54",
      ]);

    //stack the data? --> stack per subgroup
    const stackedData = d3.stack().keys(subgroups)(diversityData);

    console.log(stackedData, subgroups);

    // Show the bars
    svg
      .append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data((d) => d)
      .join("rect")
      .attr("x", (d) =>
        // console.log(d.data.Company)
        x(d.data.Company)
      )
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // var bar_enter = svg.selectAll("g")
    // .data(stackedData)
    // .selectAll("rect")
    // .data(d => d)
    // .enter();

    // bar_enter.append("text")
    // .text(function(d) {
    //   return d3.format(".2s")(d.data.value)+"%"; })
    // .attr("y",  d => y(d[1]))
    // .attr("x",  d =>   x(d.data.Company)

    // )
    // .style("fill", 'black');
  });

  // Adding a tooltip (not visible yet)
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("opacity", 0);

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function (event, d) {
    console.log(d);
    const subgroupName = d3.select(this.parentNode).datum().key;
    const subgroupValue = d.data[subgroupName];
    tooltip
      .html(
        "Ethnicity: " +
          subgroupName +
          "<br>" +
          "Value: " +
          subgroupValue +
          "%" +
          "<br>" +
          d.data.Company +
          " earned $" +
          d3.format(",d")(d.data.earnings) +
          "m in 2018"
      )
      .style("opacity", 1);
  };
  const mousemove = function (event, d) {
    tooltip
      .style("transform", "translateY(-55%)")
      .style("left", event.x + "px")
      .style("top", event.y + "px");
  };
  const mouseleave = function (event, d) {
    tooltip.style("opacity", 0);
  };
}
