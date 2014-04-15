var map;
var data;
var cScale;
var val_keys;
val_arr = [];
var dm;	
var ex;

	//Load the two files, asynchronously.
	$(function(){
		queue()
			.defer(d3.json, "country.json")
			.defer(d3.json, "2011-01-01.json")
			.await(build)
		
	})	
	
	
var build = function(e, m , d){
	map = m; //the map file as json obj
	data = d; //the data as json obj
	
	var w = 1024,	h=768;
	
	val_keys = Object.keys(data.values); //need an array of keys, since the data.values is an object.

	//loop through the values to create an array of them.
	for (var i = 0; i<val_keys.length; i++){
		var val = data.values[val_keys[i]];
		val_arr.push(val);	
	}
	
	//determine the extents of the values, for scaling.
	ex = d3.extent(val_arr, function(d){return +d});
	var step = Math.ceil(ex[1]-ex[0])/5;   //a "step" that is roughly one fifth of the array
	dm = d3.range(ex[0], ex[1], step);   //a domain that contains the original extent, plus 3 "steps" to make 5 points
	
	cScale = d3.scale.linear().range([180,0])  //for a hue range
		.domain(dm);
		
	
	var projection = d3.geo.mercator().scale(128).translate([w/2,h/2]);  //select projection for drawing GIS shapes

	var pathG = d3.geo.path().projection(projection); //A path function for drawing shapes using the above projection

	//select the body and append an svg
	var svg = d3.select("body").append("svg")
		.attr("width", w)
		.attr("height", h);
	
	//and a group for our shapes
	var group = svg.append("g").attr("class","countries")
	
	//then draw the shapes	
	group.selectAll("path").data(map.features).enter().append("path")
		.style({
			"fill": function(d){  
				//apply a scaled fill color, or grey if value is null, NaN
				var val = +data.values[+d.properties.gid];
				if(!isNaN(val)){
					return d3.hsl(cScale(val),1,0.5)
					//return cScale(val) 
				}else{
					return("grey")
				}
			
				 
				}
		})
		.attr("d", pathG) //finally call the path funciton to draw the paths
	
	
	//add text for labels and position at the shape centroid.
	group.selectAll("text").data(map.features).enter().append("text")
		.text(
			function(d){
				var l = +data.values[+d.properties.gid]
				return l.toFixed(0);
				})
		.attr({
			"transform": function(d) { 
				return "translate(" + projection(d.properties.centroid.coordinates) + ")" 
				}
		})
		
		
	
	
}