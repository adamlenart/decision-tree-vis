// helper function to filter out the features with 0 importances which would only clog the view
function keepImportant(data) {
    console.log(data);
    return data.importances.filter(function (d) {
        return d.importance > 0;
    })
};

///////////////////////////////////////////////////////////
//                    barplot settings                   //
///////////////////////////////////////////////////////////

function barplotInit(data) {
    // Capture and define SVG attributes
    var svg = d3.select("#barplot_container"),
        margin = {
            top: 20,
            right: 50,
            bottom: 175,
            left: 75
        };
    var width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom;

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1),
        y = d3.scale.linear().rangeRound([height, 0]);
    //var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    //    y = d3.scaleLinear().rangeRound([height, 0]);

    // Define X, Y domains
    var xScale = x.domain(data.map(function (d) {
        return d.attribute;
    }));
    var yScale = y.domain([0, d3.max(data, function (d) {
        return d.importance;
    })])
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    barplot = {
        svg: svg,
        margin: margin,
        width: width,
        height: height,
        g: g,
        x: x,
        y: y,
        xScale: xScale,
        yScale: yScale,
        yAxis: yAxis,
        xAxis: xAxis
    }
    return barplot;
};


////////////////////////////////////////
//              Barplot               //
////////////////////////////////////////


function draw(data) {
    console.log(data);
    barplot = barplotInit(data);


    // Define X,Y Axes
    // X
    barplot.g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0, " + barplot.height + ")")
        .call(barplot.xAxis)
        .selectAll("text")
        .attr("transform", " translate(-15, 10) rotate(-65)")
        .style("text-anchor", "end");

    barplot.g.append("text")
        .attr("dx", "1em")
        .attr("y", barplot.height + (barplot.margin.bottom))
        .attr("x", barplot.width / 2 - barplot.margin.right)
        .text("Attribute")
        .style("font-size", "20px");

    // Y
    barplot.g.append("g")
        .attr("class", "axis axis--y")
        .call(barplot.yAxis);
    barplot.g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "0.71em")
        .attr("y", 0 - barplot.margin.left / 2 - 25)
        .attr("x", 0 - (barplot.height / 2) - 30)
        .text("Importance")
        .style("font-size", "20px");

    // Define bars
    barplot.g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return barplot.xScale(d.attribute);
        })
        .attr("y", function (d) {
            return barplot.yScale(d.importance);
        })
        .attr("width", function (d) {
            return (barplot.width / data.length - 10);
        })
        .attr("height", function (d) {
            return barplot.height - barplot.yScale(d.importance);
        })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", function (d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip_bar.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip_bar.select("text")
                .text(d.attribute + ": " + d.importance);

        });

    ////////////////////////////////////////////
    //              tooltip                   //
    ////////////////////////////////////////////
    
    var tooltip_bar = barplot.svg.append("g")
        .attr("class", "tooltip_bar")
        .style("display", "none");

    tooltip_bar.append("rect")
        .attr("width", 30)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip_bar.append("text")
        .attr("x", 15)
        .attr("dy", "1.2em")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill","black");

    function mouseover() {
        tooltip_bar.style("display", null);
    }

    function mouseout() {
        tooltip_bar.style("display", "none");
    }
};




///////////////////////////////////////
//                 Sort              //
///////////////////////////////////////


function rank(data) {
    return data.sort(function (a, b) {
        return d3.descending(a.importance, b.importance);
    }).map(function (d) {
        return d.attribute;
    });
};

function sort_alphabetically(data) {
    return data.sort(function (a, b) {
        return d3.ascending(a.attribute, b.attribute);
    }).map(function (d) {
        return d.attribute;
    });
};

function make_sort_order(id, data) {
    if (id === "button_ranking") {
        var sortOrder = rank(data);
    } else {
        var sortOrder = sort_alphabetically(data);
    }
    return sortOrder;
};

function sortFeature(data) {
    // get initial settings
    barplot = barplotInit(data);

    d3.selectAll(".sort-button").on("click", function () {
        var sortOrder = make_sort_order(this.id, data);
        var xScale_sorted = barplot.xScale.domain(sortOrder);
        d3.selectAll('.bar')
            .transition()
            .delay(function (d, i) {
                return i * 15;
            })
            .attr("x", function (d) {
                console.log()
                return xScale_sorted(d.attribute);
            });
        xAxis = d3.svg.axis().scale(xScale_sorted).orient("bottom");
        //xAxis = d3.axisBottom(xScale_sorted);
        d3.select('.axis--x')
            .call(xAxis)
            .selectAll("text")
            .transition()
            .delay(function (d, i) {
                return i * 15;
            })
            .attr("transform", " translate(-15, 10) rotate(-65)")
            .style("text-anchor", "end");
    })

};