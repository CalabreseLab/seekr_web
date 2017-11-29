function histogram(){

var data = d3.range(1000).map(d3.randomBates(10));

var formatCount = d3.format(",.0f");

var svg = d3.select("svg"),
    margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
    .rangeRound([0, width]);

var bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(20))
    (data);

var y = d3.scaleLinear()
    .domain([0, d3.max(bins, function(d) { return d.length; })])
    .range([height, 0]);

var bar = g.selectAll(".bar")
  .data(bins)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
    .attr("height", function(d) { return height - y(d.length); });

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.length); });

g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
}


//I keep the my test clean input in case anything not make sense
function kmerHeatmap(rowLabel,colLabel,hcrow,hccol,clean,original){

var arr = clean.reduce(function (p, c) {
    return p.concat(c);
});

var sample_max = Math.max.apply(null, arr);
var sample_min = Math.min.apply(null, arr);

var margin = { top: 150, right: 10, bottom: 50, left: 100 },
    cellSize=35;
    col_number=colLabel.length;
    row_number=rowLabel.length;
    width = cellSize*col_number, // - margin.left - margin.right,
    height = cellSize*row_number , // - margin.top - margin.bottom,
    legendElementWidth = cellSize,
    colorBuckets = 21,
    colors =['#3366cc','#0000cc', '#000066', '#000000', '#999900', '#cccc00', '#ffff00']

    function hey(clean,original) {

        data=[];
        for(i=1; i<=col_number; i++){
            for(j=1; j<=row_number;j++){

                var obj = {row: j, col: i, val:clean[j-1][i-1] , origin:original[j-1][i-1]};
                data.push(obj)

            }
        }

        var colorScale = d3.scale.quantile()
            .domain([ sample_min, sample_max])
            .range(colors);

        var svg = d3.select("#kmer_chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var rowSortOrder=false;
        var colSortOrder=false;
        var rowLabels = svg.append("g")
            .selectAll(".rowLabelg")
            .data(rowLabel)
            .enter()
            .append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
            .attr("class", function (d,i) { return "rowLabel mono r"+i;} )
            .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
            .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
            .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
        ;

        var colLabels = svg.append("g")
            .selectAll(".colLabelg")
            .data(colLabel)
            .enter()
            .append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; })
            .style("text-anchor", "left")
            .attr("transform", "translate("+cellSize/2 + ",-6) rotate (-90)")
            .attr("class",  function (d,i) { return "colLabel mono c"+i;} )
            .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
            .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
            .on("click", function(d,i) {colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
        ;

        var heatMap = svg.append("g").attr("class","g3")
            .selectAll(".cellg")
            .data(data,function(d){return d.row+":"+d.col;})
            .enter()
            .append("rect")
            .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
            .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
            .attr("class", function(d){return "cell cell-border cr"+(d.row-1)+" cc"+(d.col-1);})
            .attr("width", cellSize)
            .attr("height", cellSize)
            .style("fill", function(d) { return colorScale(d.val); })
            .style("stroke", '#000000')
            .on("mouseover", function(d){
                //highlight text
                d3.select(this).classed("cell-hover",true);
                d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==(d.row-1);});
                d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==(d.col-1);});

                //Update the tooltip position and val
                d3.select("#tooltip")
                    .style("left", (d3.event.pageX+10) + "px")
                    .style("top", (d3.event.pageY-10) + "px")
                    .select("#value")
                    .text("sequence_name: "+rowLabel[d.row-1]+" kmer: "+colLabel[d.col-1]+"\ncount:"+d.origin+"  idx:"+d.col+","+d.row);

                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(){
                d3.select(this).classed("cell-hover",false);
                d3.selectAll(".rowLabel").classed("text-highlight",false);
                d3.selectAll(".colLabel").classed("text-highlight",false);
                d3.select("#tooltip").classed("hidden", true);
            })
        ;
        //setting the color sacle
        var dis = (sample_max-sample_min)/6;
//        var legend = svg.selectAll(".legend")
//            .data([sample_min,Math.round(sample_min+dis),Math.round(sample_min+dis*2),Math.round(sample_min+dis*3),Math.round(sample_min+dis*4),Math.round(sample_min+dis*5),Math.round(sample_min+dis*6)]
//                )
//            .enter().append("g")
//            .attr("class", "legend");
//
//        legend.append("rect")
//            .attr("x", function(d, i) { return w * i; })
//            .attr("y", height+20)
//            .attr("width", 5)
//            .attr("height", 5)
//            .style("fill", function(d, i) { return colors[i]; });
//
//        legend.append("text")
//            .attr("class", "mono")
//            .text(function(d) { return d; })
//            .attr("width", legendElementWidth)
//            .attr("x", function(d, i) { return legendElementWidth * i; })
//            .attr("y", height + 20);

// Change ordering of cells

        function sortbylabel(rORc,i,sortOrder){
            var t = svg.transition().duration(3000);
            var log2r=[];
            var sorted; // sorted is zero-based index
            d3.selectAll(".c"+rORc+i)
                .filter(function(ce){
                    log2r.push(ce.val);
                })
            ;
            if(rORc=="r"){ // sort log2ratio of a gene
                sorted=d3.range(col_number).sort(function(a,b){ if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
                t.selectAll(".cell")
                    .attr("x", function(d) { return sorted.indexOf(d.col-1) * cellSize; })
                ;
                t.selectAll(".colLabel")
                    .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
                ;
            }else{ // sort log2ratio of a contrast
                sorted=d3.range(row_number).sort(function(a,b){if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
                t.selectAll(".cell")
                    .attr("y", function(d) { return sorted.indexOf(d.row-1) * cellSize; })
                ;
                t.selectAll(".rowLabel")
                    .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
                ;
            }
        }

        d3.select("#kmer_reset").on("click",function(){
            order('hsclust');
        });

        function order(val){
            if(val=="hclust"){
                var t = svg.transition().duration(3000);
                t.selectAll(".cell")
                    .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
                    .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
                ;

                t.selectAll(".rowLabel")
                    .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; })
                ;

                t.selectAll(".colLabel")
                    .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; })
                ;

            }else if (val=="probecontrast"){
                var t = svg.transition().duration(3000);
                t.selectAll(".cell")
                    .attr("x", function(d) { return (d.col - 1) * cellSize; })
                    .attr("y", function(d) { return (d.row - 1) * cellSize; })
                ;

                t.selectAll(".rowLabel")
                    .attr("y", function (d, i) { return i * cellSize; })
                ;

                t.selectAll(".colLabel")
                    .attr("y", function (d, i) { return i * cellSize; })
                ;

            }else if (val=="probe"){
                var t = svg.transition().duration(3000);
                t.selectAll(".cell")
                    .attr("y", function(d) { return (d.row - 1) * cellSize; })
                ;

                t.selectAll(".rowLabel")
                    .attr("y", function (d, i) { return i * cellSize; })
                ;
            }else if (val=="contrast"){
                var t = svg.transition().duration(3000);
                t.selectAll(".cell")
                    .attr("x", function(d) { return (d.col - 1) * cellSize; })
                ;
                t.selectAll(".colLabel")
                    .attr("y", function (d, i) { return i * cellSize; })
                ;
            }
        }
        //
        var sa=d3.select(".g3")
            .on("mousedown", function() {
                if( !d3.event.altKey) {
                    d3.selectAll(".cell-selected").classed("cell-selected",false);
                    d3.selectAll(".rowLabel").classed("text-selected",false);
                    d3.selectAll(".colLabel").classed("text-selected",false);
                }
                var p = d3.mouse(this);
                sa.append("rect")
                    .attr({
                        rx      : 0,
                        ry      : 0,
                        class   : "selection",
                        x       : p[0],
                        y       : p[1],
                        width   : 1,
                        height  : 1
                    })
            })
            .on("mousemove", function() {
                var s = sa.select("rect.selection");

                if(!s.empty()) {
                    var p = d3.mouse(this),
                        d = {
                            x       : parseInt(s.attr("x"), 10),
                            y       : parseInt(s.attr("y"), 10),
                            width   : parseInt(s.attr("width"), 10),
                            height  : parseInt(s.attr("height"), 10)
                        },
                        move = {
                            x : p[0] - d.x,
                            y : p[1] - d.y
                        }
                    ;

                    if(move.x < 1 || (move.x*2<d.width)) {
                        d.x = p[0];
                        d.width -= move.x;
                    } else {
                        d.width = move.x;
                    }

                    if(move.y < 1 || (move.y*2<d.height)) {
                        d.y = p[1];
                        d.height -= move.y;
                    } else {
                        d.height = move.y;
                    }
                    s.attr(d);

                    // deselect all temporary selected state objects
                    d3.selectAll('.cell-selection.cell-selected').classed("cell-selected", false);
                    d3.selectAll(".text-selection.text-selected").classed("text-selected",false);

                    d3.selectAll('.cell').filter(function(cell_d, i) {
                        if(
                            !d3.select(this).classed("cell-selected") &&
                            // inner circle inside selection frame
                            (this.x.baseVal.val)+cellSize >= d.x && (this.x.baseVal.val)<=d.x+d.width &&
                            (this.y.baseVal.val)+cellSize >= d.y && (this.y.baseVal.val)<=d.y+d.height
                        ) {

                            d3.select(this)
                                .classed("cell-selection", true)
                                .classed("cell-selected", true);

                            d3.select(".r"+(cell_d.row-1))
                                .classed("text-selection",true)
                                .classed("text-selected",true);

                            d3.select(".c"+(cell_d.col-1))
                                .classed("text-selection",true)
                                .classed("text-selected",true);
                        }
                    });
                }
            })
            .on("mouseup", function() {
                // remove selection frame
                sa.selectAll("rect.selection").remove();

                // remove temporary selection marker class
                d3.selectAll('.cell-selection').classed("cell-selection", false);
                d3.selectAll(".text-selection").classed("text-selection",false);
            })
            .on("mouseout", function() {
                if(d3.event.relatedTarget.tagName=='html') {
                    // remove selection frame
                    sa.selectAll("rect.selection").remove();
                    // remove temporary selection marker class
                    d3.selectAll('.cell-selection').classed("cell-selection", false);
                    d3.selectAll(".rowLabel").classed("text-selected",false);
                    d3.selectAll(".colLabel").classed("text-selected",false);
                }
            });
    };
    hey(clean,original);
}

function pearsonHeatmap(rowLabel,colLabel,hcrow,hccol, matrix){


var margin = { top: 150, right: 10, bottom: 50, left: 100 },
    cellSize=35;
    col_number=colLabel.length;
    row_number=rowLabel.length;
    width = cellSize*col_number, // - margin.left - margin.right,
    height = cellSize*row_number , // - margin.top - margin.bottom,
    legendElementWidth = cellSize*0.9,
    colorBuckets = 21,
    colors =['#084594', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#deebf7', '#f7fbff'];

    var colorScale = d3.scale.quantile()
            .domain([-1, 1])
            .range(colors);

    data=[];
        for(i=1; i<=col_number; i++){
            for(j=1; j<=row_number;j++){

                var obj = {row: j, col: i, value:matrix[j-1][i-1]}
                data.push(obj)

            }
        }


var svg = d3.select("#pearson_chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var rowSortOrder=false;
  var colSortOrder=false;
  var rowLabels = svg.append("g")
      .selectAll(".rowLabelg")
      .data(rowLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
      .attr("class", function (d,i) { return "rowLabel mono r"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
      ;

  var colLabels = svg.append("g")
      .selectAll(".colLabelg")
      .data(colLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; })
      .style("text-anchor", "left")
      .attr("transform", "translate("+cellSize/2 + ",-6) rotate (-90)")
      .attr("class",  function (d,i) { return "colLabel mono c"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
      ;

  var heatMap = svg.append("g").attr("class","g3")
        .selectAll(".cellg")
        .data(data,function(d){return d.row+":"+d.col;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
        .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
        .attr("class", function(d){return "cell cell-border cr"+(d.row-1)+" cc"+(d.col-1);})
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", function(d) { return colorScale(d.value); })
        .style("stroke", '#000000')
        /* .on("click", function(d) {
               var rowtext=d3.select(".r"+(d.row-1));
               if(rowtext.classed("text-selected")==false){
                   rowtext.classed("text-selected",true);
               }else{
                   rowtext.classed("text-selected",false);
               }
        })*/
        .on("mouseover", function(d){
               //highlight text
               d3.select(this).classed("cell-hover",true);
               d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==(d.row-1);});
               d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==(d.col-1);});

               //Update the tooltip position and value
               d3.select("#tooltip")
                 .style("left", (d3.event.pageX+10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .select("#value")
                 .text("lables:"+rowLabel[d.row-1]+","+colLabel[d.col-1]+"\ndata:"+d.value+"\nrow-col-idx:"+d.col+","+d.row+"\ncell-xy "+this.x.baseVal.value+", "+this.y.baseVal.value);
               //Show the tooltip
               d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(){
               d3.select(this).classed("cell-hover",false);
               d3.selectAll(".rowLabel").classed("text-highlight",false);
               d3.selectAll(".colLabel").classed("text-highlight",false);
               d3.select("#tooltip").classed("hidden", true);
        })
        ;

  var legend = svg.selectAll(".legend")
      .data([-0.10,-0.9,-0.8,-0.7,-0.6,-0.5,-0.4,-0.3,-0.2,-0.1,0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0.10])
      .enter().append("g")
      .attr("class", "legend");

  legend.append("rect")
    .attr("x", function(d, i) { return legendElementWidth * i; })
    .attr("y", height+(cellSize*2))
    .attr("width", legendElementWidth)
    .attr("height", cellSize)
    .style("fill", function(d, i) { return colors[i]; });

  legend.append("text")
    .attr("class", "mono")
    .text(function(d) { return d; })
    .attr("width", legendElementWidth)
    .attr("x", function(d, i) { return legendElementWidth * i; })
    .attr("y", height + (cellSize*4));

// Change ordering of cells

  function sortbylabel(rORc,i,sortOrder){
       var t = svg.transition().duration(3000);
       var log2r=[];
       var sorted; // sorted is zero-based index
       d3.selectAll(".c"+rORc+i)
         .filter(function(ce){
            log2r.push(ce.value);
          })
       ;
       if(rORc=="r"){ // sort log2ratio of a gene
         sorted=d3.range(col_number).sort(function(a,b){ if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
         t.selectAll(".cell")
           .attr("x", function(d) { return sorted.indexOf(d.col-1) * cellSize; })
           ;
         t.selectAll(".colLabel")
          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
         ;
       }else{ // sort log2ratio of a contrast
         sorted=d3.range(row_number).sort(function(a,b){if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
         t.selectAll(".cell")
           .attr("y", function(d) { return sorted.indexOf(d.row-1) * cellSize; })
           ;
         t.selectAll(".rowLabel")
          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
         ;
       }
  }

  d3.select("#pearson_reset").on("click",function(){
    order('hclust');
  });

  function order(value){
   if(value=="hclust"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
      .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
      ;

    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; })
      ;

    t.selectAll(".colLabel")
      .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; })
      ;

   }else if (value=="probecontrast"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("x", function(d) { return (d.col - 1) * cellSize; })
      .attr("y", function(d) { return (d.row - 1) * cellSize; })
      ;

    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;

    t.selectAll(".colLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;

   }else if (value=="probe"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("y", function(d) { return (d.row - 1) * cellSize; })
      ;

    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;
   }else if (value=="contrast"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("x", function(d) { return (d.col - 1) * cellSize; })
      ;
    t.selectAll(".colLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;
   }
  }
  //
  var sa=d3.select(".g3")
      .on("mousedown", function() {
          if( !d3.event.altKey) {
             d3.selectAll(".cell-selected").classed("cell-selected",false);
             d3.selectAll(".rowLabel").classed("text-selected",false);
             d3.selectAll(".colLabel").classed("text-selected",false);
          }
         var p = d3.mouse(this);
         sa.append("rect")
         .attr({
             rx      : 0,
             ry      : 0,
             class   : "selection",
             x       : p[0],
             y       : p[1],
             width   : 1,
             height  : 1
         })
      })
      .on("mousemove", function() {
         var s = sa.select("rect.selection");

         if(!s.empty()) {
             var p = d3.mouse(this),
                 d = {
                     x       : parseInt(s.attr("x"), 10),
                     y       : parseInt(s.attr("y"), 10),
                     width   : parseInt(s.attr("width"), 10),
                     height  : parseInt(s.attr("height"), 10)
                 },
                 move = {
                     x : p[0] - d.x,
                     y : p[1] - d.y
                 }
             ;

             if(move.x < 1 || (move.x*2<d.width)) {
                 d.x = p[0];
                 d.width -= move.x;
             } else {
                 d.width = move.x;
             }

             if(move.y < 1 || (move.y*2<d.height)) {
                 d.y = p[1];
                 d.height -= move.y;
             } else {
                 d.height = move.y;
             }
             s.attr(d);

                 // deselect all temporary selected state objects
             d3.selectAll('.cell-selection.cell-selected').classed("cell-selected", false);
             d3.selectAll(".text-selection.text-selected").classed("text-selected",false);

             d3.selectAll('.cell').filter(function(cell_d, i) {
                 if(
                     !d3.select(this).classed("cell-selected") &&
                         // inner circle inside selection frame
                     (this.x.baseVal.value)+cellSize >= d.x && (this.x.baseVal.value)<=d.x+d.width &&
                     (this.y.baseVal.value)+cellSize >= d.y && (this.y.baseVal.value)<=d.y+d.height
                 ) {

                     d3.select(this)
                     .classed("cell-selection", true)
                     .classed("cell-selected", true);

                     d3.select(".r"+(cell_d.row-1))
                     .classed("text-selection",true)
                     .classed("text-selected",true);

                     d3.select(".c"+(cell_d.col-1))
                     .classed("text-selection",true)
                     .classed("text-selected",true);
                 }
             });
         }
      })
      .on("mouseup", function() {
            // remove selection frame
         sa.selectAll("rect.selection").remove();

             // remove temporary selection marker class
         d3.selectAll('.cell-selection').classed("cell-selection", false);
         d3.selectAll(".text-selection").classed("text-selection",false);
      })
      .on("mouseout", function() {
         if(d3.event.relatedTarget.tagName=='html') {
             sa.selectAll("rect.selection").remove();
             d3.selectAll('.cell-selection').classed("cell-selection", false);
             d3.selectAll(".rowLabel").classed("text-selected",false);
             d3.selectAll(".colLabel").classed("text-selected",false);
         }
      });
      }

//myMain(rowLabel,colLabel,hcrow,hccol,clean,original)
