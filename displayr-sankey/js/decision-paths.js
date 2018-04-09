// helpher functions

// find maximum number of columns for the table (longest path)
function getColumns(data) {
    ncols = 0;
    var ncol = $.each(data, function (row) {
        ncols = Math.max(data[row].length, ncols);
    });
    return ncols;
}




////////////////////////////////////////////////////
//    Draw a table listing the decision paths     //
////////////////////////////////////////////////////

function decisionPathInit(data) {
    var ncols = getColumns(data.decision_paths);

    var svg = d3.select("#decision_path_tab").append('svg').attr("width", 800).attr("height", 500),
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

    var decisionPath = {
        'svg': svg,
        'g': g,
        'ncols': ncols
    };

    return decisionPath;
}

function drawDecisionPathTable(data) {
    dp = decisionPathInit(data);
    var colnames = ['root']
    var nodenames = Array.apply(null, Array(dp.ncols - 2)).map(function (d,i) {
        return 'node_' + (i+1) 
    })
    var colnames = colnames.concat(nodenames).concat(['terminal_node'])

    var table = d3.select('#decision-path-table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');
    // header row
    thead.append('tr').selectAll('th')
        .data(colnames)
        .enter()
        .append('th')
        .text(function (col) {
            return col;
        });

    var rows = tbody.selectAll('tr')
        .data(d3.values(data.decision_paths))
        .enter()
        .append('tr')

    var cells = rows.selectAll('td')
        .data(function (row) {
            return colnames.map(function (colname,i) {
                return {
                    column: colname,
                    value: row[i] //data.leaf_values[row[i]]
                };
            });
        })
        .enter()
        .append('td')
        .text(function (d) {
            if(d.column === 'terminal_node') {
                return data.leaf_values[d.value];
            }
            return d.value;
        });
};
/*
		var table = d3.select('body').append('table')
		var thead = table.append('thead')
		var	tbody = table.append('tbody');

		// append the header row
		thead.append('tr')
		  .selectAll('th')
		  .data(columns).enter()
		  .append('th')
		    .text(function (column) { return column; });

		// create a row for each object in the data
		var rows = tbody.selectAll('tr')
		  .data(data)
		  .enter()
		  .append('tr');

		// create a cell in each row for each column
		var cells = rows.selectAll('td')
		  .data(function (row) {
		    return columns.map(function (column) {
		      return {column: column, value: row[column]};
		    });
		  })
		  .enter()
		  .append('td')
		    .text(function (d) { return d.value; });
            */
/*
$.getJSON('https://data.cdc.gov/api/views/w9j2-ggv5/rows.json', function(dat){
  var row;
  var type;
  for(i=0; i<dat.data.length; i++){
    row = dat.data[i];
    if (i%2 === 0) type='even';
    else type='odd';
    $('#dr').append('<tr class="' + type + '"><td>' + row["8"] + '</td><td>' + row["9"] + '</td><td>' + row["10"] + '</td><td class="decimal">' + row["11"] + '</td><td class="decimal">' + row["12"] + '</td></tr>')
  }
    
})


<table id="dr" class="fancy" cellspacing="0">
  <thead>
    <tr><th scope="col">Year</th>
      <th scope="col">Race</th><th scope="col">Sex</th><th scope="col" class="decimal">Life expectancy</th><th scope="col" class="decimal">Death rate</th>
  </thead>
  <tbody>

  </tbody>
</table>
*/
