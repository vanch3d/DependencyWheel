/* global d3 */
export default function() {
    let chartWidth = 960,
        chartMargin = 150;

    let groupWidth = 20;
    let groupPadding = 0.02;

    let fill = null;
    let tooltip = null;

    function chart(selection){
        console.log(selection);

        selection.each(function (data){
            let {matrix} = data,
                {packageNames} = data,
                {attributes} = data;
            let radius = chartWidth / 2 - chartMargin;

            // the default tooltip for the arc
            tooltip = tooltip || function(d,i) {
                if (attributes && attributes[i]) return attributes[i].description;
                return packageNames[i] || "";
            };

            // the default color selector for filling the chords & ars
            fill = fill || function (d) {
                if (d.index === 0) return '#ccc';
                return "hsl(" + parseInt("" + ((packageNames[d.index][0].charCodeAt(0) - 97) / 26) * 360, 10) + ",90%,70%)";
            };

            // create the layout
            let chord = d3.chord()
                .padAngle(groupPadding)
                .sortSubgroups(d3.descending);

            let chordResult = chord(matrix);
            //let rootGroup = chordResult.groups[0];
            let {groups} = chordResult;
            let [rootGroup] = groups;

            // create the main chart
            let svgChart = d3.select(this)
                .selectAll("svg")
                .data([data])
                .enter().append("svg")
                .attr("font-family", "sans-serif")
                .attr("font-size", "14")
                .attr("width", chartWidth)
                .attr("height", chartWidth)
                .append("g")
                .attr("transform", "translate(" + (0) + "," + (0) + ")");

            // create the background
            svgChart.append("rect")
                .attr("width", chartWidth)
                .attr("height", chartWidth)
                .attr("fill", "#333")
                .attr("stroke", "#ccc")
                .attr("x", 0)
                .attr("y", 0);


            let rotation = -(rootGroup.endAngle - rootGroup.startAngle) / 2 * (180 / Math.PI);

            let g = svgChart
                .append("g")
                .attr("transform", function () { return "rotate(" + rotation + ")"; })
                .attr("transform", "translate(" + (chartWidth / 2) + "," + (chartWidth / 2) + ")");

            // Returns an event handler for fading a given chord group.
            let fade = function (opacity) {
                return function (g, i) {
                    svgChart.selectAll(".chord")
                        .filter(function (d) {
                            return d.source.index !== i && d.target.index !== i;
                        })
                        .transition()
                        .style("opacity", opacity);
                    let groups = [];
                    svgChart.selectAll(".chord")
                        .filter(function (d) {
                            if (d.source.index === i) {
                                groups.push(d.target.index);
                            }
                            if (d.target.index === i) {
                                groups.push(d.source.index);
                            }
                            return groups
                        });
                    groups.push(i);
                    let {length} = groups;
                    svgChart.selectAll('.group')
                        .filter(function (d) {
                            for (let i = 0; i < length; i++) {
                                if (groups[i] === d.index) return false;
                            }
                            return true;
                        })
                        .transition()
                        .style("opacity", opacity);
                };
            };


            let arc = d3.arc()
                .innerRadius(radius)
                .outerRadius(radius + groupWidth);

            let group = g.selectAll("group-chord")
                .data(chordResult.groups)
                .enter();

            group.append("path")
                .style("fill", fill)
                .style("stroke", fill)
                .attr("d", arc)
                .attr("class", "group")
                .style("cursor", "pointer")
                .on("mouseover", fade(0.1))
                .on("mouseout", fade(1))
                .append("title").text(tooltip);

            group.append("svg:text")
                .each(function (d) { d.angle = (d.startAngle + d.endAngle) / 2; })
                .attr("dy", ".35em")
                .attr("class", "group-name")
                .attr("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
                .attr("transform", function (d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                        + "translate(" + (radius + 26) + ")"
                        + (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .style("cursor", "pointer")
                .text(function (d) { return packageNames[d.index]; })
                .on("mouseover", fade(0.1))
                .on("mouseout", fade(1))
                .append("title").text(tooltip);


            g.selectAll("path-chord")
                .data(chordResult)
                .enter().append("path")
                .attr("class", "chord")
                .style("stroke", function (d) {
                    return d3.rgb(fill(d.source)).darker();
                })
                .style("fill", function (d) {
                    return fill(d.source);
                })
                .attr("d", d3.ribbon().radius(radius))
                .style("opacity", 1);

        });

        return chart;
    }

    chart.width = function(value) {
        if (!arguments.length) return chartWidth;
        chartWidth = value;
        return chart;
    };

    chart.margin = function(value) {
        if (!arguments.length) return chartMargin;
        chartMargin = value;
        return chart;
    };

    chart.groupPadding = function(value) {
        if (!arguments.length) return groupPadding;
        groupPadding = value;
        return chart;
    };

    chart.groupWidth = function(value) {
        if (!arguments.length) return groupWidth;
        groupWidth = value;
        return chart;
    };

    chart.fill = function(fct) {
        fill = fct;
        return chart;
    };

    chart.tooltip = function(fct) {
        tooltip = fct;
        return chart;
    };

    return chart;
}
