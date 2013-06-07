var ypaginate = require('nodejs-yapaginate/lib/main.js');

exports.paginate = function(req, res, next, model_name, options) {
	var limit = 3;
	options = options || {};
	require('../models/models.js') [model_name].count(options)
		.success(function(count) {
			var pageno = parseInt(req.query.pageno) || 1;
			req.pagination = {
				offset: limit * (pageno -1),
				limit: limit
			};
			res.locals.paginate_view = ypaginate({
				totalItem: count,
				itemPerPage: limit,
				currentPage: pageno,
				url: require('url').parse(req.url).pathname,
				firstText: 'Primera',
				lastText: 'Última',
				nextText: 'Siguiente',
				prevText: 'Anterior'
			});
			next();
		})
		.error(function(error) {	
			next(error);
		});
}
