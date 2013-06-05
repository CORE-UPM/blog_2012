var express = require ('express');
var app = express();

var cont=0;
exports.count_mw = (function(req, res, next) {
	
	if (req.url == '/'){
		
		cont++;
		req.number = cont;
		console.log("Visitas: " + req.number);
	}
	
	next();

});

// exports.getCount= function(){

// 	return cont;
// }
