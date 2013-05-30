
var yapaginate = require('nodejs-yapaginate/lib/main.js');

/*
*  La funcion asignada a este atributo se usa para facilitar la paginacion.
*
*  Se debe llamar desde un middleware creado en la definicion de rutas, pasandonos los valores de 
*  req, res y next.
*
* Se encarga de contar el numero de objetos que hay que paginar, y añadir a req un objeto con las 
* opciones que hay que usar en la llamada a findAll, para obtener solo los valores de la pagina que 
* nos interesa. El objeto añadido a req es:
*
* 			req.pagination = {
*		    	offset: <numero>,
*		    	limit: <numero>
*			};
*
* Tambien se crea una variable local en la respuesta, llamada paginate_view, con el codigo HTML 
* que pinta los botones del control de paginacion.
*
* Los argumentos de esta funcion son:
*
*   - model_name: Es el nombre de un modelo, por ejemplo: User, Post, Comment, ...
*                 La paginacion se realizara sobre los objetos de este modelo.
*                 Para crear el control HTML de paginacion (los botones que nos permiten 
*                 seleccionar la pagina que queremos ver) es necesario contar cuantos objetos
*                 existen de este modelo. Para contarlos se usa el metodo count().
*                 A este metodo count se le pueden pasar opciones para filtrar los objetos 
*                 a contar. Normalmente no se pasaran opciones o se pasara una condicion WHERE.
*                 Por ejemplo, supongamos que vamos a paginar los comentarios del post con id 66;
*                 entonces para contar cuantos comentarios existen de ese post, llamaremos a 
*                 "Comment.count({where: {postId: 66}})". En este caso el valor de options seria
*                 el objeto {where: {postId: 66}}.
*
*   - options: Son las opciones a pasar al metodo count() para que cuente solo los items que nos 
*              interesan.
*              Normalmente se omitira, o sera una condicion WHERE.
*
*   - req, res y next son los parametros pasados al middleware que llama a esta funcion. 
*/
exports.paginate = function(req, res, next, model_name, options) {

	var limit = 3;
	
	options = options || {};

	require('../models/models.js')[model_name].count(options)
	    .success(function(count) {
		
			var pageno = parseInt(req.query.pageno) || 1;
		
			req.pagination = {
		    	offset: limit * (pageno - 1),
		    	limit: limit
			};
		
			res.locals.paginate_view = yapaginate({
			    totalItem:   count, 
			    itemPerPage: limit, 
			    currentPage: pageno, 
			    url: require('url').parse(req.url).pathname,
			    firstText: 'Primero',
			    lastText: 'Último',
			    nextText: 'Siguiente',
			    prevText: 'Anterior'
			});
			
			next();
		    })
        .error(function(error) { next(error); });
};

