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

    // create column names
    var colnames = ['rank', 'root']
    var nodenames = Array.apply(null, Array(dp.ncols - 2)).map(function (d, i) {
        return 'node_' + (i + 1)
    })
    var colnames = colnames.concat(nodenames).concat(['terminal_node'])

    // table element containers
    var table = d3.select('#decision-path-table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    //////////////////////////////////////
    //       Fill up the table          //
    //////////////////////////////////////

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

    var rowIndex = 0;
    var cells = rows.selectAll('td')
        .data(function (row) {
            return colnames.map(function (colname, i) {
                if (colname === 'rank') {
                    rowIndex++;
                }
                return {
                    column: colname,
                    value: row[i - 1],
                    rownum: rowIndex
                };
            });
        })
        .enter()
        .append('td')
        .text(function (d) {
            if (d.column === 'rank') {
                return d.rownum;
            }
            if (d.column === 'terminal_node') {
                //console.log(data.leaf_values);
                //console.log(d.value);
                return d.value + ': [' + data.leaf_values[d.value] + "]";
            }
            return d.value;
        });

    sortDecisionPaths(rows)
};

////////////////////////////////////
//              Sort              //
////////////////////////////////////

function leafValueExtractor(row, n) {
    if (n == 2) {
        // cut leaf from the beginning of the string
        return parseInt(row[5].substring(4));
    }
    return data.leaf_values[row[5]][n];
};

function sortDecisionPaths(rows) {

    d3.select('#sort-table')
        .on("change", function () {
            v = d3.select('#sort-table').property('value');
            rows.sort(function (a, b) {

                var a = leafValueExtractor(a, v),
                    b = leafValueExtractor(b, v)
                if (v === '2') {
                    return d3.ascending(a, b);
                }
                return d3.descending(a, b);
            });
        });
};
