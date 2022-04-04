function drawTreeMap(){
let diversityData = "http://localhost:8000/employee-diversity-in-tech.csv";
    // set the dimensions and margins of the graph
const margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 445 - margin.left - margin.right,
  height = 445 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#tree_map")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

// read json data
d3.csv(diversityData).then( function(data) {

    // const companies = ["Google", "Microsoft", "Facebook", "Apple", "Amazon"]
    const companies = ["Google"]
    data = data.filter(
        (line) =>
          companies.includes(line.Company) && line.Date === "01/05/18"
      );
      console.log(data)

//      const entries = new Map(data)

//      const obj = Object.fromEntries(entries);

// console.log(obj);

// const hi = Object.keys(data).forEach(key => {

//     return {children: {}}
//     // {value:data[0][key], name:key, parent: "Google"};
//   });

// const hi = "hi"



const hi = {
    children: data.map(item => ({name: item.Company, children: Object.keys(item).forEach(key => console.log( item, {name: key, value:item[key]}))}))
};

  console.log(hi)

//   console.log('nhis')

//     0: {name: "Origin", parent: "", value: ""}
// 1: {name: "grp1", parent: "Origin", value: "12"}
// 2: {name: "grp2", parent: "Origin", value: "23"}
// 3: {name: "grp3", parent: "Origin", value: "11"}
// 4: {name: "grp4", parent: "Origin", value: "40"}
// 5: {name: "grp5", parent: "Origin", value: "30"}
// 6: {name: "grp6", parent: "Origin", value: "25"}

   // stratify the data: reformatting for d3.js
   const root = d3.stratify()
   .id(function(d) { return d.name; })   // Name of the entity (column name is name in csv)
   .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
   (data);
 root.sum(function(d) { return +d.value })   // Compute the numeric value for each entity

 // Then d3.treemap computes the position of each element of the hierarchy
 // The coordinates are added to the root object above
 d3.treemap()
   .size([width, height])
   .padding(4)
   (root)

 // use this information to add rectangles:
 svg
   .selectAll("rect")
   .data(root.leaves())
   .join("rect")
     .attr('x', function (d) { return d.x0; })
     .attr('y', function (d) { return d.y0; })
     .attr('width', function (d) { return d.x1 - d.x0; })
     .attr('height', function (d) { return d.y1 - d.y0; })
     .style("stroke", "black")
     .style("fill", "#69b3a2");

 // and to add the text labels
 svg
   .selectAll("text")
   .data(root.leaves())
   .join("text")
     .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
     .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
     .text(function(d){ return d.data.name})
     .attr("font-size", "15px")
     .attr("fill", "white")
})
}