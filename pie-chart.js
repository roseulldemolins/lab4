function drawPieChart(){

var dataset = {
  apples: [53245, 28479, 19697, 24037, 40245],
  oranges: [53245, 28479, 19697, 24037, 40245],
  lemons: [53245, 28479, 19697, 24037, 40245],
  pears: [53245, 28479, 19697, 24037, 40245],
  pineapples: [53245, 28479, 19697, 24037, 4045],
};

var width = 460,
    height = 300,
    cwidth = 25;
var color = 'black'
var pie = d3.pie()
    .sort(null);
var arc = d3.arc();
var svg = d3.select("#pie_chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
var gs = svg.selectAll("g").data(dataset).enter().append("g");
var path = gs.selectAll("path")
    .data(function(d) { return 
      pie(d); })
  .enter().append("path").transition().duration(750).attrTween("d", arcTween)
    .attr("fill", function(d, i) { return 'black'; })
    .attr("d", function(d, i, j) { return arc.innerRadius(10+cwidth*j).outerRadius(cwidth*(j+1))(d); });
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}
}