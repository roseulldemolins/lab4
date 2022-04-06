function drawChartRace(){
  let duration = 250
  let n = 1

  margin = ({top: 16, right: 6, bottom: 6, left: 0})

  formatDate = d3.utcFormat("%Y")

  width = 1000
  barSize = 2
  height = margin.top + barSize * n + margin.bottom

  let k = 10 

  function bars(svg){
    let bar = svg.append("g")
        .attr("fill-opacity", 0.6)
      .selectAll("rect");
  
    return ([date, data], transition) => bar = bar
      .data(data.slice(0, n), d => d.name)
      .join(
        enter => enter.append("rect")
          .attr("fill", color)
          .attr("height", y.bandwidth())
          .attr("x", x(0))
          .attr("y", d => y((prev.get(d) || d).rank))
          .attr("width", d => x((prev.get(d) || d).value) - x(0)),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("y", d => y((next.get(d) || d).rank))
          .attr("width", d => x((next.get(d) || d).value) - x(0))
      )
      .call(bar => bar.transition(transition)
        .attr("y", d => y(d.rank))
        .attr("width", d => x(d.value) - x(0)));
  }
  x = d3.scaleLinear([0, 1], [margin.left, width - margin.right])

  y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
    .padding(0.1)

  function axis(svg) {
    const g = svg.append("g")
        .attr("transform", `translate(0,${margin.top})`);
  
    const axis = d3.axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));
  
    return (_, transition) => {
      g.transition(transition).call(axis);
      g.select(".tick:first-of-type text").remove();
      g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
      g.select(".domain").remove();
    };
  }

  function labels(svg) {
    let label = svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
      .selectAll("text");
  
    return ([date, data], transition) => label = label
      .data(data.slice(0, n), d => d.name)
      .join(
        enter => enter.append("text")
          .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
          .attr("y", y.bandwidth() / 2)
          .attr("x", -6)
          .attr("dy", "-0.25em")
          .text(d => d.name)
          .call(text => text.append("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .attr("x", -6)
            .attr("dy", "1.15em")),
        update => update,
        exit => exit.transition(transition).remove()
          .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
          .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
      )
      .call(bar => bar.transition(transition)
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
  }

  function ticker(svg) {
    const now = svg.append("text")
        .style("font", `bold ${barSize}px var(--sans-serif)`)
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .attr("x", width - 6)
        .attr("y", margin.top + barSize * (n - 0.45))
        .attr("dy", "0.32em")
        .text(formatDate(keyframes[0][0]));
  
    return ([date], transition) => {
      transition.end().then(() => now.text(formatDate(date)));
    };
  }

let companyData = "http://localhost:8000/category-brands.csv"

var svg = d3.select("#bar_race")
.attr("width", 960)
.attr("height", 300);

const updateBars = bars(svg);
  const updateAxis = axis(svg);
  const updateLabels = labels(svg);
  const updateTicker = ticker(svg);


  for (const keyframe of keyframes) {
    const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value]);

    updateAxis(keyframe, transition);
    updateBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateTicker(keyframe, transition);




d3.csv(companyData).then(function(data) {


  const names = new Set(data.map(d => d.name))
//if (error) throw error;

const datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  .map(([date, data]) => [new Date(date), data])
  .sort(([a], [b]) => d3.ascending(a, b))

})

function rank(value) {
  const data = Array.from(names, name => ({name, value: value(name)}));
  data.sort((a, b) => d3.descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
  return data;
}


let keyframes = [];
let ka, a, kb, b;
for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
  for (let i = 0; i < k; ++i) {
    const t = i / k;
    keyframes.push([
      new Date(ka * (1 - t) + kb * t),
      rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
    ]);
  }
}





  keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);

  const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)

  const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
  
  
}}