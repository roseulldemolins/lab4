function removeLineChart(country) {
  d3.select("#line_vacc_svg").selectAll("g").remove();
  lineChartVaccines(country);
}

function lineChartVaccines(chosenCountry) {
  let latestData = "http://localhost:8000/full-data-vaccinations.csv";

  // set the dimensions and margins of the graph
  const margin = { top: 50, right: 30, bottom: 50, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#line_vacc_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //Read the data
  d3.csv(latestData).then(function (data) {
    if (chosenCountry !== "All") {
      data = data.filter(
        (country) =>
          country.location == chosenCountry &&
          country.date.includes("2021") &&
          country.continent !== ""
      );
    } else {
      data = data.filter(
        (country) => country.date.includes("2021") && country.continent !== ""
      );
    }

    const meanVacc = d3.rollup(
      data,
      (v) => d3.mean(v, (d) => d.people_vaccinated_per_hundred),
      (d) => d.date
    );

    const meanCases = d3.rollup(
      data,
      (v) => d3.mean(v, (d) => d.total_cases_per_million),
      (d) => d.date
    );

    const meanBoosters = d3.rollup(
      data,
      (v) => d3.mean(v, (d) => d.total_boosters_per_hundred),
      (d) => d.date
    );

    // Add X axis --> it is a date format
    const x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d3.timeParse("%Y-%m-%d")(d.date);
        })
      )
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(8));

    svg
      .selectAll("text")
      .attr("transform", "rotate(-65)")
      .style("text-anchor", "end");

    svg
      .append("text")
      // Using height and width to make it easier to change
      .attr("y", height + margin.top)
      .attr("x", width / 2)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .style("font-family", "sans-serif")
      .text("Month");

    svg
      .append("circle")
      .attr("cx", 25)
      .attr("cy", 25)
      .attr("r", 6)
      .style("fill", "#a248cf");
    svg
      .append("circle")
      .attr("cx", 25)
      .attr("cy", 50)
      .attr("r", 6)
      .style("fill", "#c91caf");
    svg
      .append("circle")
      .attr("cx", 25)
      .attr("cy", 75)
      .attr("r", 6)
      .style("fill", "#de284d");
    svg
      .append("text")
      .attr("x", 40)
      .attr("y", 50)
      .text("Cases per 100")
      .style("font-size", "10px")
      .attr("alignment-baseline", "middle")
      .attr("font-family", "sans-serif");
    svg
      .append("text")
      .attr("x", 40)
      .attr("y", 25)
      .text("Vaccinated people per 100")
      .style("font-size", "10px")
      .attr("alignment-baseline", "middle")
      .attr("font-family", "sans-serif");
    svg
      .append("text")
      .attr("x", 40)
      .attr("y", 75)
      .text("Boosters per 100 people")
      .style("font-size", "10px")
      .attr("alignment-baseline", "middle")
      .attr("font-family", "sans-serif");

    const all = [];
    data.map((country) => {
      all.push(country.total_cases_per_million / 1000);
      all.push(+country.people_vaccinated_per_hundred);
    });

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([d3.min(all), d3.max(all)])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    const color = d3.scaleOrdinal().range(["#a248cf", "#c91caf", "#de284d"]);

    let lastVaccinated = 0;
    let lastBoosted = 0;
    // Draw the line

    svg
      .append("path")
      .datum(meanVacc)
      .attr("fill", "none")
      .attr("stroke", "#a248cf")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d3.timeParse("%Y-%m-%d")(d[0]));
          })
          .y(function (d) {
            if (d[1] == "") {
              return y(lastVaccinated);
            } else {
              lastVaccinated = +d[1];
              return y(+d[1]);
            }
          })
      );

    svg
      .append("path")
      .datum(meanCases)
      .attr("fill", "none")
      .attr("stroke", "#c91caf")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d3.timeParse("%Y-%m-%d")(d[0]));
          })
          .y(function (d) {
            return y(d[1] / 1000);
          })
      );

    svg
      .append("path")
      .datum(meanBoosters)
      .attr("fill", "none")
      .attr("stroke", "#de284d")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d3.timeParse("%Y-%m-%d")(d[0]));
          })
          .y(function (d) {
            if (d[1] == "") {
              return y(lastBoosted);
            } else {
              lastBoosted = +d[1];
              return y(+d[1]);
            }
          })
      );
  });
}
