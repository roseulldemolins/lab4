function drawChartRace(){

let companyData = "http://localhost:8000/testing.csv"

var svg = d3.select("#bar_race")
.attr("width", 960)
.attr("height", 600);



var tickDuration = 2000;

var top_n = 5;
var height = 600;
var width = 960;

const margin = {
top: 80,
right: 0,
bottom: 5,
left: 0
};

let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

let title = svg.append('text')
.attr('class', 'title')
.attr('y', 24)
.html('18 years of Interbrand’s Top Global Brands');

let subTitle = svg.append("text")
.attr("class", "subTitle")
.attr("y", 55)
.html("Brand value, $m");

let caption = svg.append('text')
.attr('class', 'caption')
.attr('x', width)
.attr('y', height-5)
.style('text-anchor', 'end')
.html('Source: Interbrand');

let year = 2015;

d3.csv(companyData).then(function(data) {
//if (error) throw error;

console.log(data);

const companies = ["Google", "Microsoft", "Facebook", "Apple", "Amazon"]
// const companies = ["Google"]
data = data.filter(
    (line) =>
      companies.includes(line.Company)
  );

 data.forEach(d => {
  d.value = +d.value,
  d.lastValue =  5,
  d.value = isNaN(d.value) ? 0 : d.value,
  d.year = +d.year,
  d.colour = d3.hsl(Math.random()*360,0.75,0.75)
});

console.log(data);

let yearSlice = data.filter(d => 
    d.year == year && !isNaN(d.value))
.sort((a,b) => b.value - a.value)
.slice(0, 5);

yearSlice.forEach((d,i) => d.rank = i);

console.log('yearSlice: ', yearSlice)

let x = d3.scaleLinear()
  .domain([0, d3.max(yearSlice, d => d.value)])
  .range([margin.left, width-margin.right-65]);



let y = d3.scaleLinear()
  .domain([5, 0])
  .range([height-margin.bottom, margin.top]);

let xAxis = d3.axisTop()
  .scale(x)
  .ticks(width > 500 ? 5:2)
  .tickSize(-(height-margin.top-margin.bottom))
  .tickFormat(d => d3.format(',')(d));

svg.append('g')
 .attr('class', 'axis xAxis')
 .attr('transform', `translate(0, ${margin.top})`)
 .call(xAxis)
 .selectAll('.tick line')
//  .classed('origin', d => d == 0);

svg.selectAll('rect.bar')
  .data(yearSlice, d => d.Company)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', x(0)+1)
  .attr('width', d => x(d.value)-x(0)-1)
  .attr('y', d => y(d.rank)+5)
  .attr('height', y(1)-y(0)-barPadding)
  .style('fill', d => console.log(x(d.value)-x(0)-1));

svg.selectAll('text.label')
  .data(yearSlice, d => d.Company)
  .enter()
  .append('text')
  .attr('class', 'label')
  .attr('x', d => x(d.value)-8)
  .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
  .style('text-anchor', 'end')
  .html(d => d.Company);

svg.selectAll('text.valueLabel')
.data(yearSlice, d => d.Company)
.enter()
.append('text')
.attr('class', 'valueLabel')
.attr('x', d => x(d.value)+5)
.attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
.text(d => d3.format(',.0f')(d.lastValue));

let yearText = svg.append('text')
.attr('class', 'yearText')
.attr('x', width-margin.right)
.attr('y', height-25)
.style('text-anchor', 'end')
.html(~~year)
.call(halo, 10);

let ticker = d3.interval(e => {


yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
  .sort((a,b) => b.value - a.value)
  .slice(0,top_n);

  console.log(data)

  console.log('IntervalYear: ', yearSlice);

yearSlice.forEach((d,i) => d.rank = i);

console.log('IntervalYear: ', yearSlice);

x.domain([0, d3.max(yearSlice, d => d.value)]); 

svg.select('.xAxis')
  .transition()
  .duration(tickDuration)
  .ease(d3.easeLinear)
  .call(xAxis);

 let bars = svg.selectAll('.bar').data(yearSlice, d => d.Company);

 bars
  .enter()
  .append('rect')
  .attr('class', d => `bar ${d.Company.replace(/\s/g,'_')}`)
  .attr('x', x(0)+1)
  .attr( 'width', d => x(d.value)-x(0)-1)
  .attr('y', d => y(top_n+1)+5)
  .attr('height', y(1)-y(0)-barPadding)
  .style('fill', d => d.colour)
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('y', d => y(d.rank)+5);
    
 bars
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('width', d => x(d.value)-x(0)-1)
    .attr('y', d => y(d.rank)+5);
      
 bars
  .exit()
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('width', d => x(d.value)-x(0)-1)
    .attr('y', d => y(top_n+1)+5)
    .remove();

 let labels = svg.selectAll('.label')
    .data(yearSlice, d => d.Company);

 labels
  .enter()
  .append('text')
  .attr('class', 'label')
  .attr('x', d => x(d.value)-8)
  .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
  .style('text-anchor', 'end')
  .html(d => d.Company)    
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
       

    labels
    .transition()
    .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)-8)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

 labels
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)-8)
      .attr('y', d => y(top_n+1)+5)
      .remove();
   


 let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.Company);

 valueLabels
    .enter()
    .append('text')
    .attr('class', 'valueLabel')
    .attr('x', d => x(d.value)+5)
    .attr('y', d => y(top_n+1)+5)
    .text(d => d3.format(',.0f')(d.lastValue))
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
      
 valueLabels
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
      .tween("text", function(d) {
         let i = d3.interpolateRound(d.lastValue, d.value);
         return function(t) {
           this.textContent = d3.format(',')(i(t));
        };
      });


valueLabels
  .exit()
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('x', d => x(d.value)+5)
    .attr('y', d => y(top_n+1)+5)
    .remove();

yearText.html(~~year);

if(year == 2018) ticker.stop();
year = d3.format('.1f')((+year) + 1);
},tickDuration);

});

const halo = function(text, strokeWidth) {
text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
.style('fill', '#ffffff')
.style( 'stroke','#ffffff')
.style('stroke-width', strokeWidth)
.style('stroke-linejoin', 'round')
.style('opacity', 1);

}   
}