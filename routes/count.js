/**
 * @author Manuel Flores Llorente
 * @author Victor Julio Sanchez Pollo
 */

var cont = 0;

exports.count_mw = function() {

    return function(req, res, next) {
        // Se filtran las ejecuciones de count.js para que las visitas
        // aumenten de uno en uno. Para ello se utilizan las llamadas
        // a style.css que se producen siempre y una única vez cada
        // vez que se accede a una página.
        if (res.req.url === "/stylesheets/style.css")
            cont++;

        next();
    };
};

exports.getCount = function() {
    return cont;
}




    