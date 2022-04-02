function stackedBar(chosenCountry) {
  // CSV for covid vaccinations based on country and age group
  let vaccinations = "http://localhost:8000/vaccinations-age-group.csv";

  // set the dimensions and margins of the graph
  const margin = { top: 40, right: 30, bottom: 30, left: -300 },
    width = 550 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#stacked_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Parse the Data
  d3.csv(vaccinations).then(function (data) {
    countries = new Set(
      data.map((country) => {
        return country.location;
      })
    );

    if (countries.has(chosenCountry)) {
      data = data.filter(
        (country) =>
          country.location == chosenCountry && country.date == "2021-09-21"
      );

      data = data.map((country) => {
        const vaccinated_with_booster = country.total_boosters_per_hundred
          ? country.total_boosters_per_hundred
          : 0;
        const fully_vaccinated =
          country.people_fully_vaccinated_per_hundred - vaccinated_with_booster;
        const vaccinated =
          country.people_vaccinated_per_hundred - fully_vaccinated;
        return {
          fully_vaccinated,
          vaccinated,
          vaccinated_with_booster,
          age_group: country.age_group,
        };
      });

      // List of subgroups = header of the csv files = soil condition here
      const subgroups = [
        "fully_vaccinated",
        "vaccinated",
        "vaccinated_with_booster",
      ];

      // List of groups = species here = value of the first column called group -> I show them on the X axis
      const groups = data.map((d) => {
        return d.age_group;
      });

      // Add X axis
      const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));
      svg    
      .append('text')
      // Using height and width to make it easier to change
      .attr('y', height + margin.top + 25)
      .attr('x', width/2)
      .attr('text-anchor', 'end')
      .attr('stroke', 'black')
      .style('font-family', 'sans-serif')
      .text('Age Group')

      // color palette = one color per subgroup
      const color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(["#a248cf", "#c91caf", "#de284d"]);

        let tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("opacity", 0);

      //stack the data? --> stack per subgroup
      const stackedData = d3.stack().keys(subgroups)(data);
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
        .attr("x", (d) => x(d.data.age_group))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        
    }
  });
}
