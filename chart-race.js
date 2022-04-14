function drawChartRace(filter){

// The data csv file
let companyData = "http://localhost:8000/final-chart-race.csv"

// This indicates the speed for each year (in milliseconds)
var tickDuration = 3000;

// How many top companies to show
var top_n = 10;

// Height and width of svgs
var height = 350;
var width = 960;

// Select svg and setting height and widths
var svg = d3.select("#bar_race")
.attr("width", width)
.attr("height", height);

// Setting margin as an object - easier to change
const margin = {
top: 25,
right: 0,
bottom: 5,
left: 0
};

// White space between the bars
let barPadding = 10

// The year to begin from 
let year = 2014;

// Reading the csv file
d3.csv(companyData).then(function(data) {

// Copy of data that won't be changed
const allData = data 

// Filtering the data to only tech and social media
const sectors = ["Tech", "Social Media"]
data = data.filter(
    (line) =>
      sectors.includes(line.Type)
  );

  if(filter){
  // Filtering the data to only tech and social media
const companies = ["Facebook", "Apple", "Google", "Microsoft", "Amazon"]
top_n = 5
data = data.filter(
    (line) =>
      companies.includes(line.Company)
  );
}

  // Getting data in wanted format (no NaN's, making everything integer with +)
 data.forEach(d => {
  d.value = +d.value,
  d.lastValue =  +d.lastValue,
  d.value = isNaN(d.value) ? 0 : +d.value,
  d.year = +d.year,
  d.colour = d.Type == "Tech" ? "#38071c" : "#e9c7d6",
  d.fontColour = d.Type !== "Tech" ? "#38071c" : "#e9c7d6"
});

// Grouping the data per year and sorting based on the value
let yearSlice = data.filter(d => 
    d.year == year && !isNaN(d.value))
.sort((a,b) => b.value - a.value)
.slice(0, 5);

// Getting the previous year value
function getPreviousValue(line){
    // This is because 2015 was the first year
    const previousYear = line.year == 2015 ? 2015 : line.year - 1 
    const name = line.Company
    return allData.find(
        (dataLine) => {
          // Logic to say it must be the given year and company
        dataLine.year == +previousYear && dataLine.Company == name
    })}


// Setting the rank based on the index (because it's sorted)
yearSlice.forEach((d,i) => d.rank = i);

// Setting the scale for the x axis
let x = d3.scaleLinear()
  .domain([0, d3.max(yearSlice, d => d.value)])
  .range([margin.left, width-margin.right-65]);

// Setting the scale for the y axis
let y = d3.scaleLinear()
  .domain([top_n, 0])
  .range([height-margin.bottom, margin.top]);

// Creating the x axis
let xAxis = d3.axisTop()
  .scale(x)
  // This sets the lines for each 10%
  .ticks(5)
  .tickSize(-(height-margin.top-margin.bottom))
// Adding percentage time at the end
  .tickFormat(d => d + '%');

svg.selectAll('.yearText').remove()
// Adding the x axis
svg.append('g')
 .attr('class', 'axis xAxis')
 .attr('transform', `translate(0, ${margin.top})`)
 .call(xAxis)

// Selecting all the bars and setting height, width and location
svg.selectAll('rect.bar')
// Attaching the relevant years data
  .data(yearSlice, d => d.Company)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  // Sets x to start at 0
  .attr('x', x(0))
  // Width is the value take away 0
  .attr('width', d => x(d.value)-x(0))
  // Y coordinate is based on rank (higher further up)
  .attr('y', d => y(d.rank))
  // Height of bar takes into account padding
  .attr('height', y(1)-y(0)-barPadding)
  // Colour is based on if it's tech or social media
  .style('fill', d => d.color);

// Adding the labels to be the company name
svg.selectAll('text.label')
  .data(yearSlice, d => d.Company)
  .enter()
  .append('text')
  .attr('class', 'label')
  // So the label sits to the right inside the bar
  .attr('x', d => x(d.value)-8)
  // So the label is in the center
  .attr('y', d => y(d.rank)+((y(1)-y(0))/2))
  .style('text-anchor', 'end')
  // Font colour is based on category
  .style('fill', d => d.fontColour)
  // Setting the text to be the name
  .html(d => d.Company);

// Adding the labels for the % value
svg.selectAll('text.valueLabel')
.data(yearSlice, d => d.Company)
.enter()
.append('text')
.attr('class', 'valueLabel')
// X so it sits to the right (magic number 5)
.attr('x', d => x(d.value))
// Y so it's in the center
.attr('y', d => y(d.rank)+((y(1)-y(0))/2))
// Adds a % sign on the end
.text(d => d + '%');


// This is the text that shows the current year
let yearText = svg.append('text')
.attr('class', 'yearText')
.attr('x', width-margin.right)
.attr('y', height-25)
.style('text-anchor', 'end')
.html(~~year)

// This block of road is ran on the interval set off (changes for each year)
let ticker = d3.interval(e => {

// Setting the year and filtering the data to that and sorting based on value
yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
  .sort((a,b) => b.value - a.value)
  .slice(0,top_n);

// Setting a new rank based on index value of sorted array
yearSlice.forEach((d,i) => d.rank = i);

// Setting a new domain based on year
x.domain([0, d3.max(yearSlice, d => d.value)]); 

// Updating thhe x axis with a transition
svg.select('.xAxis')
  .transition()
  .duration(tickDuration)
  .ease(d3.easeLinear)
  .call(xAxis);

// Selecting the bars and attaching the relevant year data
 let bars = svg.selectAll('.bar').data(yearSlice, d => d.Company);

 // Setting properties of bars but relevant to year
 bars
  .enter()
  .append('rect')
  // Unique class so that it can be selected again
  .attr('class', d => `bar ${d.Company.replace(/\s/g,'_')}`)
  .attr('x', x(0))
  .attr( 'width', d => x(d.value)-x(0))
  .attr('y', d => y(top_n+1))
  .attr('height', y(1)-y(0)-barPadding)
  .style('fill', d => d.colour)
  // Transition to make it smooth
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('y', d => y(d.rank));
  
// Sets the transition
 bars
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('width', d => x(d.value)-x(0))
    .attr('y', d => y(d.rank));

// Transition when exiting
 bars
  .exit()
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('width', d => x(d.value)-x(0))
    .attr('y', d => y(top_n+1))
    .remove();


// Setting the labels to be the company
 let labels = svg.selectAll('.label')
    .data(yearSlice, d => d.Company);


    // Setting the labels for the end of the bars to be the cimpany
 labels
  .enter()
  .append('text')
  .attr('class', 'label')
  .attr('x', d => x(d.value)-8)
  .attr('y', d => y(top_n+1)+((y(1)-y(0))/2))
  .style('text-anchor', 'end')
  .html(d => d.Company)  
  .style('fill', d => d.fontColour)  
  // Transition to make it smooth
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('y', d => y(d.rank)+((y(1)-y(0))/2));
       
// Transition to move the label vertically
    labels
    .transition()
    .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)-8)
      .attr('y', d => y(d.rank)+((y(1)-y(0))/2));

// Transition when the labels leave
 labels
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)-8)
      .attr('y', d => y(top_n+1))
      .remove();
   

// Setting the data to be the relevant one for year
 let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.Company);

 // Setting the location of text labels
 valueLabels
    .enter()
    .append('text')
    .attr('class', 'valueLabel')
    .attr('x', d => x(d.value))
    .attr('y', d => y(top_n+1))
    .text(d => d.value + '%')
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+1);

// Transition to it's smooth
 valueLabels
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      // Labels in the center of bar
      .attr('x', d => x(d.value))
      .attr('y', d => y(d.rank)+((y(1)-y(0))/2))
      .tween("text", function(d) {
        // This interpolates between the value before and the next value
         let i = d3.interpolateRound(d.lastValue, d.value);
         return function(t) {
           this.textContent = (i(t)) + '%';
        };
      });

// Transition of value labels leaving
valueLabels
  .exit()
  .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .attr('x', d => x(d.value))
    .attr('y', d => y(top_n+1))
    .remove();

// Set the text to be the current year
yearText.html(year);

// Stop when it gets to 2018 (last year in data)
if(year == 2018) ticker.stop();
year =(+year) + 1;
},tickDuration);
});
 
}