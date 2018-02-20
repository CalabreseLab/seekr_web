

function kmerHeatmap(rowLabel,colLabel,hcrow,hccol,clean,original){

    var arr = clean.reduce(function (p, c) {

        return p.concat(c);
    });

    for (var i = 0; i < arr.size; i++) {

        arr[i] = parseFloat(arr[i]);
    }

    arr.sort(function (a, b) {  return a - b;  });

    var sample_max = arr[arr.length-1];
    var sample_min = arr[0];

    var margin =  {top: 75, right: 10, bottom: 100, left: 150};
    var cellSize=(colLabel.length > 16)? 15 : 35;
    var col_number=colLabel.length;
    var row_number=rowLabel.length;
    var legendElementSize = 35;
    var colorBuckets = 21;
    var colors = ['#cce0ff','#99c2ff','#66a3ff','#3385ff', '#0066ff','#0052cc','#003d99','#002966','#001433','#000000','#333300','#666600','#999900','#cccc00','#ffff00','#ffff33','#ffff66','#ffff99','#ffffcc']
    var width = Math.max(colors.length*legendElementSize, cellSize*col_number); // - margin.left - margin.right,
    var height = cellSize*row_number; // - margin.top - margin.bottom,
    var data=[];
    for(var i=1; i<=col_number; i++){
        for(var j=1; j<=row_number;j++){

            var obj = {row: j, col: i, val:clean[j-1][i-1] , origin:original[j-1][i-1]};
            data.push(obj)

        }
    }

    var colorScale = d3.scale.quantile()
        .domain([sample_min, sample_max])
        .range(colors);

    var svg = d3.select("#kmer_chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "container canvas")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

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
        .style("font-family", "Verdana, Arial, sans-serif")
        .style("font-size", "7pt")
        .attr("transform", "translate(-6," + cellSize / 2 + ")")
        .attr("class", function (d,i) { return "k_rowLabel mono r"+i;} )
        .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
        .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
        .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);});

    var colLabels = svg.append("g")
        .selectAll(".colLabelg")
        .data(colLabel)
        .enter()
        .append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; })
        .style("text-anchor", "left")
        .style("font-family", "Verdana, Arial, sans-serif")
        .style("font-size", "7pt")
        .attr("transform", "translate("+cellSize/2 + ",-6) rotate (-90)")
        .attr("class",  function (d,i) { return "k_colLabel mono c"+i;} )
        .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
        .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
        .on("click", function(d,i) {colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);});

    var heatMap = svg.append("g").attr("class","g3")
        .selectAll(".cellg")
        .data(data,function(d){return d.row+":"+d.col;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
        .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
        .attr("class", function(d){return "cell cell-border k_cr"+(d.row-1)+" k_cc"+(d.col-1);})
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", function(d) { return colorScale(d.val); })
        .on("mouseover", function(d){
            //highlight text
            d3.select(this).classed("cell-hover",true);
            d3.selectAll(".k_rowLabel").classed("text-highlight",function(r,ri){ return ri==(d.row-1);});
            d3.selectAll(".k_colLabel").classed("text-highlight",function(c,ci){ return ci==(d.col-1);});

            //Update the tooltip position and val
            d3.select("#kmer_tooltip")
                .style("left", (d3.event.pageX+10) + "px")
                .style("top", (d3.event.pageY-10) + "px")
                .select("#k_value")
                .text("sequence_name: "+rowLabel[d.row-1]+" kmer: "+colLabel[d.col-1]+"\ncount:"+d.origin);

            //Show the tooltip
            d3.select("#kmer_tooltip").classed("hidden", false);
        })
        .on("mouseout", function(){
            d3.select(this).classed("cell-hover",false);
            d3.selectAll(".k_rowLabel").classed("text-highlight",false);
            d3.selectAll(".k_colLabel").classed("text-highlight",false);
            d3.select("#kmer_tooltip").classed("hidden", true);
        })
    ;
    //setting the color sacle

  var legend = svg.selectAll(".legend")
      .data(colorScale.quantiles())
      .enter().append("g")
      .attr("class", "legend");

  legend.append("rect")
    .attr("x", function(d, i) { return legendElementSize * i; })
    .attr("y", height+margin.bottom/3)
    .attr("width", legendElementSize)
    .attr("height", legendElementSize)
    .style("fill", function(d, i) { return colors[i]; });

  legend.append("text")
    .attr("class", "mono")
    .text(function(d) { return Math.round(d * 100)/100; })
    .attr("width", legendElementSize)
    .attr("x", function(d, i) { return legendElementSize * i + 2; })
    .attr("y", height + margin.bottom/3 + legendElementSize*1.5);


    function sortbylabel(rORc,i,sortOrder){
        var t = svg.transition().duration(1000);
        var count=[];
        var sorted; // sorted is zero-based index
        d3.selectAll(".k_c"+rORc+i)
            .filter(function(ce){
                count.push(ce.val);
            });
        if(rORc=="r"){
            sorted=d3.range(col_number).sort(function(a,b){return count[b]-count[a];});

            t.selectAll(".cell")
                .attr("x", function(d) { return sorted.indexOf(d.col-1) * cellSize; });
            t.selectAll(".k_colLabel")
                .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; });
        }else{ // sort log2ratio of a contrast
            sorted=d3.range(row_number).sort(function(a,b){return count[b]-count[a];});

            t.selectAll(".cell")
                .attr("y", function(d) { return sorted.indexOf(d.row-1) * cellSize; });
            t.selectAll(".k_rowLabel")
                .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; });
        }
    }

    d3.select("#kmer_reset").on("click",function(){
        order();
    });

    function order(val){
        var t = svg.transition().duration(1000);
        t.selectAll(".cell")
            .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
            .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; });

        t.selectAll(".k_rowLabel")
            .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; });

        t.selectAll(".k_colLabel")
            .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; });
    }
}

function pearsonHeatmap(rowLabel,colLabel,hcrow,hccol, matrix){

    var margin = { top: 150, right: 10, bottom: 100, left: 150 };
    var cellSize=(colLabel.length > 35)? 15 : 35;
    var col_number=colLabel.length;
    var row_number=rowLabel.length;
    var legendElementSize = 35;
    var colorBuckets = 21;
    var colors =['#003300','#154415','#2b552b','#406640','#557755','#6a886a','#809980','#95aa95','#aabbaa','#bfccbf'];
    var width = Math.max(colors.length*legendElementSize, cellSize*col_number); // - margin.left - margin.right,
    var height = cellSize*row_number; // - margin.top - margin.bottom,

    var domain = matrix.reduce(function (p, c) {

        return p.concat(c);
    });

    //Calculate the color scale ignoring 1s
    var max = 0;
    var min = 0;
    for (var i = 0; i < domain.length; i++) {
        var float = parseFloat(domain[i]);
        domain[i] = float;
        min = Math.min(min, float)
        if (float != 1.0){
            max = Math.max(max, float);
        }
    }
    console.log(min, max);
    var colorScale = d3.scale.quantile()
            .domain([min, max])
            .range(colors);


    var data=[];

    for(var i=1; i<=col_number; i++){
        for(var j=1; j<=row_number;j++){

            var obj = {row: j, col: i, value:matrix[j-1][i-1]}
            data.push(obj)

        }
    }


    var svg = d3.select("#pearson_chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "container canvas")
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
      .style("font-family", "Verdana, Arial, sans-serif")
      .style("font-size", "7pt")
      .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
      .attr("class", function (d,i) { return "p_rowLabel mono r"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);});

    var colLabels = svg.append("g")
      .selectAll(".colLabelg")
      .data(colLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; })
      .style("text-anchor", "left")
      .style("font-family", "Verdana, Arial, sans-serif")
      .style("font-size", "7pt")
      .attr("transform", "translate("+cellSize/2 + ",-6) rotate (-90)")
      .attr("class",  function (d,i) { return "p_colLabel mono c"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);});

    var heatMap = svg.append("g").attr("class","g3")
        .selectAll(".cellg")
        .data(data,function(d){return d.row+":"+d.col;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
        .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
        .attr("class", function(d){return "cell cell-border p_cr"+(d.row-1)+" p_cc"+(d.col-1);})
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", function(d) { return colorScale(d.value); })
        .on("click", function(d) {
               var rowtext=d3.select(".r"+(d.row-1));
               if(rowtext.classed("text-selected")==false){
                   rowtext.classed("text-selected",true);
               }else{
                   rowtext.classed("text-selected",false);
               }
        })
        .on("mouseover", function(d){
               //highlight text
               d3.select(this).classed("cell-hover",true);
               d3.selectAll(".p_rowLabel").classed("text-highlight",function(r,ri){ return ri==(d.row-1);});
               d3.selectAll(".p_colLabel").classed("text-highlight",function(c,ci){ return ci==(d.col-1);});

               //Update the tooltip position and value
               d3.select("#pearson_tooltip")
                 .style("left", (d3.event.pageX+10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .select("#p_value")
                 .text("sequences:"+rowLabel[d.row-1]+","+colLabel[d.col-1]+"\npearson value:"+d.value);
               //Show the tooltip
               d3.select("#pearson_tooltip").classed("hidden", false);
        })
        .on("mouseout", function(){
               d3.select(this).classed("cell-hover",false);
               d3.selectAll(".p_rowLabel").classed("text-highlight",false);
               d3.selectAll(".p_colLabel").classed("text-highlight",false);
               d3.select("#pearson_tooltip").classed("hidden", true);
        });

  var legend = svg.selectAll(".legend")
      .data(colorScale.quantiles())
      .enter().append("g")
      .attr("class", "legend");

  legend.append("rect")
    .attr("x", function(d, i) { return legendElementSize * i; })
    .attr("y", height + margin.bottom/3)
    .attr("width", legendElementSize)
    .attr("height", legendElementSize)
    .style("fill", function(d, i) { return colors[i]; });

  legend.append("text")
    .attr("class", "mono")
    .text(function(d) { return Math.round(d * 100)/100; })
    .attr("width", legendElementSize)
    .attr("x", function(d, i) { return legendElementSize * i + 2; })
    .attr("y", height + margin.bottom/3 + legendElementSize * 1.5);

// Change ordering of cells

  function sortbylabel(rORc,i,sortOrder){

       var t = svg.transition().duration(1000);
       var pearson=[];
       var sorted;
       d3.selectAll(".p_c"+rORc+i)
         .filter(function(ce){
            pearson.push(ce.value);
          })
       ;
       if(rORc=="r"){
         sorted=d3.range(col_number).sort(function(a,b){ return pearson[b]-pearson[a];});
         t.selectAll(".cell")
           .attr("x", function(d) { return sorted.indexOf(d.col-1) * cellSize; });
         t.selectAll(".p_colLabel")
          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; });
       }else{
         sorted=d3.range(row_number).sort(function(a,b){return pearson[b]-pearson[a];});

         t.selectAll(".cell")
           .attr("y", function(d) { return sorted.indexOf(d.row-1) * cellSize; });
         t.selectAll(".p_rowLabel")
          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; });
       }
  }

  d3.select("#pearson_reset").on("click",function(){
    order();
  });

  function order(){
    var t = svg.transition().duration(1000);
    t.selectAll(".cell")
      .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
      .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; });

    t.selectAll(".p_rowLabel")
      .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; });

    t.selectAll(".p_colLabel")
      .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; });


  }
}
