var svgWidth = 960;
var svgHeight = 620;

var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
  };
  
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Append a div class to the scatter element
var chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = chart
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(povertyData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(povertyData, d => d[chosenXAxis]) * 0.8,
        d3.max(povertyData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);
  
    return xLinearScale;
  
}

// Function for updating yScale upon click on axis label
function yScale(povertyData, chosenYAxis) {
    // Create Scale Functions for the Chart (chosenYAxis)
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(povertyData, d => d[chosenYAxis]) * 0.8,
        d3.max(povertyData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
    return yLinearScale;
}

//Function for updating the xAxis upon click
  function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

//Function used for updating yAxis variable upon click
  function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
      yAxis.transition()
      .duration(2000)
      .call(leftAxis);
  return yAxis;
}

//Function for updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
    .duration(2000)
    .attr('cx', data => newXScale(data[chosenXAxis]))
    .attr('cy', data => newYScale(data[chosenYAxis]))

  return circlesGroup;
}

//Function for updating State labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
    .duration(2000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup
}

//Function to style x-axis values for tooltips
function styleX(value, chosenXAxis) {

  //style based on variable
  //poverty
  if (chosenXAxis === 'poverty') {
      return `${value}%`;
  }
  //household income
  else if (chosenXAxis === 'income') {
      return `${value}`;
  }
  else {
    return `${value}`;
  }
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {

    var xLabel,yLabel;

  // X label properties
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty:";
    }
    
    else if (chosenXAxis === 'income'){
        xLabel = 'Median Income:';
    }
    
    else {
       xLabel = 'Age:';
        }

  //Y label properties
  
  if (chosenYAxis ==='healthcare') {
       yLabel = "No Healthcare:"
  }
  else if(chosenYAxis === 'obesity') {
       yLabel = 'Obesity:';
  }
  
  else{
     yLabel = 'Smokers:';
  }

  //create tooltip
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
  });

  circlesGroup.call(toolTip);

  //add
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;
  }
  
  // Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(povertyData, err) {
    if (err) throw err;
    console.log(povertyData);
    // parse data
    povertyData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;

    });

// Create xLinearScale & yLinearScale functions for the Chart
var xLinearScale = xScale(povertyData, chosenXAxis);
var yLinearScale = yScale(povertyData, chosenYAxis);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// Append x axis
var xAxis = chartGroup.append("g")
.classed("x-axis", true)
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

//Append Y
var yAxis = chartGroup.append('g')
.classed('y-axis', true)
//.attr
.call(leftAxis);

 //Append initial circles
 var circlesGroup = chartGroup.selectAll("circle")
 .data(povertyData)
 .enter()
 .append("circle")
 .attr("cx", d => xLinearScale(d[chosenXAxis]))
 .attr("cy", d => yLinearScale(d[chosenYAxis]))
 .attr("r", 15)
 .attr("class","stateCircle")
 .attr("opacity", ".75");

//Append Initial Text
var textGroup = chartGroup.selectAll('.stateText')
.data(povertyData)
.enter()
.append('text')
.classed('stateText', true)
.attr('x', d => xLinearScale(d[chosenXAxis]))
.attr('y', d => yLinearScale(d[chosenYAxis]))
.attr('dy', 3)
.attr('font-size', '10px')
.text(function(d){return d.abbr});

//Create a group for the x axis labels
 var xLabelsGroup = chartGroup.append('g')
 .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

var povertyLabel = xLabelsGroup.append('text')
 .classed('aText', true)
 .classed('active', true)
 .attr('x', 0)
 .attr('y', 20)
 .attr('value', 'poverty')
 .text('In Poverty (%)');

var ageLabel = xLabelsGroup.append('text')
 .classed('aText', true)
 .classed('inactive', true)
 .attr('x', 0)
 .attr('y', 40)
 .attr('value', 'age')
 .text('Age (Median)'); 

var incomeLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

//Create a group for Y labels
var yLabelsGroup = chartGroup.append('g')
.attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');
    
    var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
    
    var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');

 //Update the toolTip
 var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
 
 //x axis event listener
 xLabelsGroup.selectAll('text')
 .on('click', function() {
   var value = d3.select(this).attr('value');

   if (value != chosenXAxis) {

     //replace chosen x with a value
     chosenXAxis = value; 

     //update x for new data
     xLinearScale = xScale(povertyData, chosenXAxis);

     //update x 
     xAxis = renderXAxis(xLinearScale, xAxis);

     //update circles with a new x value
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

     //update text 
     textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

     //update tooltip
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     //change of classes changes text
     if (chosenXAxis === 'poverty') {
       povertyLabel.classed('active', true).classed('inactive', false);
       ageLabel.classed('active', false).classed('inactive', true);
       incomeLabel.classed('active', false).classed('inactive', true);
     }
     else if (chosenXAxis === 'age') {
       povertyLabel.classed('active', false).classed('inactive', true);
       ageLabel.classed('active', true).classed('inactive', false);
       incomeLabel.classed('active', false).classed('inactive', true);
     }
     else {
       povertyLabel.classed('active', false).classed('inactive', true);
       ageLabel.classed('active', false).classed('inactive', true);
       incomeLabel.classed('active', true).classed('inactive', false);
     }
   }
 });
 //y axis lables event listener
 yLabelsGroup.selectAll('text')
 .on('click', function() {
   var value = d3.select(this).attr('value');

   if(value !=chosenYAxis) {
       //replace chosenY with value  
       chosenYAxis = value;

       //update Y scale
       yLinearScale = yScale(povertyData, chosenYAxis);

       //update Y axis 
       yAxis = renderYAxis(yLinearScale, yAxis);

       //Udate circles with new y
       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

       //update text with new Y values
       textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

       //update tooltips
       circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       //Change of the classes changes text
       if (chosenYAxis === 'obesity') {
         obesityLabel.classed('active', true).classed('inactive', false);
         smokesLabel.classed('active', false).classed('inactive', true);
         healthcareLabel.classed('active', false).classed('inactive', true);
       }
       else if (chosenYAxis === 'smokes') {
         obesityLabel.classed('active', false).classed('inactive', true);
         smokesLabel.classed('active', true).classed('inactive', false);
         healthcareLabel.classed('active', false).classed('inactive', true);
       }
       else {
         obesityLabel.classed('active', false).classed('inactive', true);
         smokesLabel.classed('active', false).classed('inactive', true);
         healthcareLabel.classed('active', true).classed('inactive', false);
       }
     }
   });
  });
