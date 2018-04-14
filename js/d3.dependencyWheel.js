d3.chart = d3.chart || {};

/**
 * Dependency wheel chart for d3.js
 *
 * Usage:
 * var chart = d3.chart.dependencyWheel();
 * d3.select('#chart_placeholder')
 *   .datum({
 *      packageNames: [the name of the packages in the matrix],
 *      matrix: [your dependency matrix]
 *      attributes: [optional, an array of key/attribute pairs for each package]
 *   })
 *   .call(chart);
 *
 * // Data must be a matrix of dependencies. The first item must be the main package.
 * // For instance, if the main package depends on packages A and B, and package A
 * // also depends on package B, you should build the data as follows:
 *
 * var data = {
 *   packageNames: ['Main', 'A', 'B'],
 *   matrix: [[0, 1, 1], // Main depends on A and B
 *            [0, 0, 1], // A depends on B
 *            [0, 0, 0]], // B doesn't depend on A or Main
 *   attributes: [
 *      { id: 'Main', description: 'this is the main package' },
 *      { id: 'A', description: 'this is the A package' },
 *      { id: 'B', description: 'this is the B package' },
 *   ]
 * };
 *
 * // You can customize the chart width, margin (used to display package names),
 * // and padding (separating groups in the wheel)
 * var chart = d3.chart.dependencyWheel()
 *                  .width(700)
 *                  .margin(150)
 *                  .padding(.02)
 *                  .fill(function(d){ return (d.index === 0) ? '#ccc' : "red" ; })
 *                  .tooltip(function(d){ return "this is a tooltip" ; });
 *
 * @author François Zaninotto
 * @license MIT
 * @see https://github.com/fzaninotto/DependencyWheel for complete source and license
 */
d3.chart.dependencyWheel = function (options) {

    var width = 700;
    var margin = 150;
    var padding = 0.02;
    var fill = null;
    var tooltip = null;

    function chart(selection) {
        selection.each(function (data) {

            var matrix = data.matrix;
            var packageNames = data.packageNames;
            var attributes = data.attributes || [];

            var radius = width / 2 - margin;

            // create the layout
            var chord = d3.chord()
                .padAngle(padding)
                .sortSubgroups(d3.descending);

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg:svg")
                .attr("width", width)
                .attr("height", width)
                .attr("class", "dependencyWheel")
                .append("g")
                .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

            var arc = d3.arc()
                .innerRadius(radius)
                .outerRadius(radius + 20);

            // the default color selector for filling the chords & ars
            fill = fill || function (d) {
                if (d.index === 0) return '#ccc';
                return "hsl(" + parseInt("" + ((packageNames[d.index][0].charCodeAt(0) - 97) / 26) * 360, 10) + ",90%,70%)";
            };

            // the default tooltip for the arc (requires 'description' key in data.attributes)
            tooltip = tooltip || function(d,i) {
                return attributes[i].description || "";
            };

            // Returns an event handler for fading a given chord group.
            var fade = function (opacity) {
                return function (g, i) {
                    gEnter.selectAll(".chord")
                        .filter(function (d) {
                            return d.source.index !== i && d.target.index !== i;
                        })
                        .transition()
                        .style("opacity", opacity);
                    var groups = [];
                    gEnter.selectAll(".chord")
                        .filter(function (d) {
                            if (d.source.index === i) {
                                groups.push(d.target.index);
                            }
                            if (d.target.index === i) {
                                groups.push(d.source.index);
                            }
                        });
                    groups.push(i);
                    var length = groups.length;
                    gEnter.selectAll('.group')
                        .filter(function (d) {
                            for (var i = 0; i < length; i++) {
                                if (groups[i] === d.index) return false;
                            }
                            return true;
                        })
                        .transition()
                        .style("opacity", opacity);
                };
            };

            var chordResult = chord(matrix);

            var rootGroup = chordResult.groups[0];
            var rotation = -(rootGroup.endAngle - rootGroup.startAngle) / 2 * (180 / Math.PI);

            var g = gEnter.selectAll("g.group")
                .data(chordResult.groups)
                .enter().append("svg:g")
                .attr("class", "group")
                .attr("transform", function (d) {
                    return "rotate(" + rotation + ")";
                });

            g.append("svg:path")
                .style("fill", fill)
                .style("stroke", fill)
                .attr("d", arc)
                .style("cursor", "pointer")
                .on("mouseover", fade(0.1))
                .on("mouseout", fade(1))
                .append("svg:title")
                    .text(tooltip);


            g.append("svg:text")
                .each(function (d) {
                    d.angle = (d.startAngle + d.endAngle) / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.angle > Math.PI ? "end" : null;
                })
                .attr("transform", function (d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                        "translate(" + (radius + 26) + ")" +
                        (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .style("cursor", "pointer")
                .text(function (d) {
                    return packageNames[d.index];
                })
                .on("mouseover", fade(0.1))
                .on("mouseout", fade(1))
                .append("svg:title")
                    .text(tooltip);


            gEnter.selectAll("path.chord")
                .data(chordResult)
                .enter().append("svg:path")
                .attr("class", "chord")
                .style("stroke", function (d) {
                    return d3.rgb(fill(d.source)).darker();
                })
                .style("fill", function (d) {
                    return fill(d.source);
                })
                .attr("d", d3.ribbon().radius(radius))
                .attr("transform", function (d) {
                    return "rotate(" + rotation + ")";
                })
                .style("opacity", 1);
        });
    }

    /**
     * Set/Get the width of the chart
     * @param value
     * @return {*}
     */
    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    /**
     * Set/Get the internal margin of the chart
     * @param value
     * @return {*}
     */
    chart.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    /**
     * Set/Get the internal padding of the chart
     * @param value
     * @return {*}
     */
    chart.padding = function (value) {
        if (!arguments.length) return padding;
        padding = value;
        return chart;
    };

    /**
     * Set the color filling for the chord and arcs of the chart
     * @param fct   A function
     * @return {chart}
     */
    chart.fill = function (fct) {
        if (fct instanceof Function)
            fill = fct;
        else
            throw new TypeError("The fill parameter is not a valid function");
        return chart;
    };

    /**
     * Set the tooltip for the arcs and labels of the chart
     * @param fct   A function
     * @return {chart}
     */
    chart.tooltip = function (fct) {
        if (fct instanceof Function)
            tooltip = fct;
        else
            throw new TypeError("The tooltip parameter is not a valid function");
        return chart;
    };

    return chart;
};
