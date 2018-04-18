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
/*
function decisionPathInit(data) {




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
*/

function addDecisionPathSortOptions(data) {
   /* var form = d3.select("#decision_path_container").append('div').attr('class', 'form-group'),
        form_label = form.append('label').attr('for', 'sel1').append('text').text('Sort Decision Path By');*/
    var form_control = d3.select('#table-sorter')
    form_control.append('option').attr('value', 'default').attr('selected', 'selected').append('text').text('Leaf number');
    var n_option = 0;
    // for each class, add an option to sort by the decision paths
    data.x.opts.classLabels.forEach(function(cl) {
        form_control.append('option').attr('value', n_option).append('text').text(cl);
        n_option++;
    });
}

function drawDecisionPathTable(data) {



    var ncols = getColumns(data.decision_paths);

    // create column names
    var colnames = ['rank', 'root']
    var nodenames = Array.apply(null, Array(ncols - 2)).map(function (d, i) {
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

    var rowIndex = 1;
    var cells = rows.selectAll('td')
        .data(function (row) {
            return colnames.map(function (colname, i) {
                return {
                    column: colname,
                    value: row[i - 1],
                };
            });
        })
        .enter()
        .append('td')
        .text(function (d) {
            if (d.column === 'rank') {
                return rowIndex++;
            }
            if (d.column === 'terminal_node') {
                //console.log(data.leaf_values);
                //console.log(d.value);
                return d.value + ': [' + data.leaf_values[d.value] + "]";
            }
            return d.value;
        });

    sortDecisionPaths(rows);
    //   console.log(cells);
};

////////////////////////////////////
//              Sort              //
////////////////////////////////////

function leafValueExtractor(row, n) {
    if (n === "default") {
        // cut leaf from the beginning of the string
        return parseInt(row[row.length -1].substring(4));
    }
    return data.leaf_values[row[row.length -1]][n];
};

function sortDecisionPaths(rows) {

    d3.select('#table-sorter')
        .on("change", function () {
            v = d3.select('#table-sorter').property('value');
            rows.sort(function (a, b) {

                var a = leafValueExtractor(a, v),
                    b = leafValueExtractor(b, v)
                if (v === 'default') {
                    return d3.ascending(a, b);
                }
                return d3.descending(a, b);
            });
            reRank(rows.selectAll('td'))
        });
};

function reRank(cells) {
    var rowIndex = 1;
    cells.text(function (d) {
        if (d.column === 'rank') {
            return rowIndex++;
        }
        if (d.column === 'terminal_node') {
            //console.log(data.leaf_values);
            //console.log(d.value);
            return d.value + ': [' + data.leaf_values[d.value] + "]";
        }
        return d.value;
    });
};
