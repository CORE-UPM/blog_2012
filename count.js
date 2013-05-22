

exports.getCount = (function(){
						var contador = 0;
						var pattern1 = /\/stylesheets\/[a-zA-Z0-9]+/;
						var pattern2 = /\/videos\/[a-zA-Z0-9]+/;
						var pattern3 = /\/images\/[a-zA-Z0-9]+/;
						return function(req, res, next){
									if(!req.path.match(pattern1) && !req.path.match(pattern2) && !req.path.match(pattern3)){
										contador++;
										req.visitas = contador;
									}
									next();
								}	
					}());