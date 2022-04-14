// Two csv files to be read from
let diversityCsv = "http://localhost:8000/final-chart-race.csv";
let companyCsv = "http://localhost:8000/category-brands-final.csv";

function drawStackedChart() {
  // Setting the dimensions and margins of the graph
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

  // These years will be used for the slider
  const dataTime = ["2015", "2016", "2017", "2018"];

  // Read in the data
  Promise.all([d3.csv(diversityCsv), d3.csv(companyCsv)]).then(function (data) {
    // Setting the two data sets (it returns an array)
    let diversityData = data[0];
    let companyData = data[1];

    // Initial chart loaded with 2015 data
    updateChart(2015, diversityData, companyData);

    // Slider created from d3
    var sliderTime = d3
      .sliderBottom()
      // Setting the minimum and maximum from the years
      .min(d3.min(dataTime))
      .max(d3.max(dataTime))
      // So the user has to move up a full year
      .step(1)
      // Setting the width so all ticks can be seen
      .width(300)
      // Formatting so no decimals or commas
      .tickFormat(d3.format("d"))
      // Attaching the years as the tick values
      .tickValues(dataTime)
      // Sets the starting position
      .default("2015")
      // On change will update the chart
      .on("onchange", (val) => {
        updateChart(val, diversityData, companyData);
      });

    // Creating the slider element itself
    var gTime = d3
      .select("div#slider-time")
      .append("svg")
      .attr("width", 350)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(30,30)");

    // Attaching slider fuunctionality to element
    gTime.call(sliderTime);
  });

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Add text label for the y axis
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("% of Ethnicity");

  function updateChart(year, diversityData, companyData) {
    // Filtering the companies to a specific year
    const companies = companyData.filter((line) => line.date.includes(year));
    
    // Hard coded because they're always the same
    let subgroups = [
      "White",
      "Asian",
      "Latino",
      "Black",
      "Multi",
      "Other",
      "Undeclared",
    ];

    // Getting just all of the companies names
    const companyNames = companies.map((line) => line.name);

    // Filtering to relevant year and company
    diversityData = diversityData.filter(
      (line) => line.year == year && companyNames.includes(line.Company)
    );

    // Calls the getProfit function on each company and sets it to be the earnings
    diversityData.forEach((d) => {
      d.earnings = getProfit(d.Company);
    });

    // Calculates profit based on company name
    function getProfit(company) {
      return companies.filter((line) => {
        return line.name == company;
      })[0].value;
    }

    // List of groups (used on axis)
    const groups = diversityData.map((d) => d.Company);

    // Add X axis
    const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);

    // Remove previous labels
    svg.selectAll(".label").remove();

    // Adding the labels for x axis (rotated to fit)
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("class", "label")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    // Text title for the x axis
    svg
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 70) + ")"
      )
      .style("text-anchor", "middle")
      .text("Technology/Social Media Company");

    // Removing previous bars
    svg.selectAll("rect").remove();

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

    // Stacking the data
    const stackedData = d3.stack().keys(subgroups)(diversityData);

    // Mouse over function for the tooltips
    const mouseover = function (event, d) {
      // Gets the subgroup name based on unique key
      const subgroupName = d3.select(this.parentNode).datum().key;
      // Gets the value of the subgroup from the data
      const subgroupValue = d.data[subgroupName];
      // Adds tooltip content
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
            "m in " +
            year
        )
        // Makes it visible
        .style("opacity", 1);
    };
// When the mouse moves the tooltip will move with it
    const mousemove = function (event, d) {
      tooltip
        .style("transform", "translateY(-55%)")
        .style("left", event.x + "px")
        .style("top", event.y + "px");
    };

    // When the mouse leaves the tooltip will disappear
    const mouseleave = function (event, d) {
      tooltip.style("opacity", 0);
    };

    // Show the bars
    svg
      .append("g")
      .selectAll("g")
      // Using the stacked data for the bars
      .data(stackedData)
      .join("g")
      // Colour is based on key (so unique)
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      // Now we add all the rectangles by looping a second time
      .data((d) => d)
      .join("rect")
      // Attach the mouse event functions
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      // X is based on the company name
      .attr("x", (d) =>
        x(d.data.Company)
      )
      // To start at the bottom axis, with height 0 for transition
      .attr("y", (d) => height)
      .attr("height", 0)
      .attr("width", x.bandwidth())
      // Then call transition over 1 second
      .transition()
      .duration(1000)
      .attr("x", (d) =>
        x(d.data.Company)
      )
      // Now the y valye is applied properly
      .attr("y", (d) => y(d[1]))
      // Height is y value at this subgroup minus the one after
      .attr("height", (d) => y(d[0]) - y(d[1]))
      // Width shared evenly
      .attr("width", x.bandwidth());

    // Adding a tooltip which won't be visible yet
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("opacity", 0);
  }
}
