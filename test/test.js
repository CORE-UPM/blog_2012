

var Browser = require("zombie");
var assert = require("assert");


describe("Visitar la página de inicio.", function() {

  var browser = new Browser();

  before(function(done) {
    browser
      .visit("http://localhost:5000")
      .then(done, done);
  });

  it("Debería cargarse la página inicial.", function() {
    assert.ok(browser.success);
    assert.equal(browser.location.pathname, "/");
  });
});


describe("Visitar la página del índice de posts.", function() {

  var browser = new Browser();

  before(function(done) {
    browser
      .visit("http://localhost:5000/posts")
      .then(done, done);
  });

  it("Deberia cargar la página con el listado de posts.", function() {
    assert.ok(browser.success);
    assert.equal(browser.location.pathname, "/posts");
  });
});


describe("Hay que hacer login para publicar.", function() {

  var browser = new Browser();

  before(function(done) {
    browser
      .visit("http://localhost:5000/posts/new")
      .then(done, done);
  });

  it("Debería cargar la página de login.", function() {
     assert.ok(browser.success);
     assert.equal(browser.location.pathname, "/login");
  });
});


describe("Crear un post.", function() {

  var browser = new Browser();

  before(function(done) {
    browser
      .visit("http://localhost:5000/posts/new")
      .then(done, done);
  });


  it("Tras el login, debería mostrar formulario de crear posts.", function(done) {
    assert.ok(browser.success);
    browser
    .fill("login","spg")
    .fill("password","1234")
    .pressButton("",function(){
       assert.ok(browser.success);
       assert.equal(browser.location.pathname, "/posts/new");
       done();
    });
  });


  it("Debería mostrar índice de posts después de crear post.", function(done) {
    browser
    .fill("post\[title\]","Título creado en una prueba")
    .fill("post\[body\]","Contenido creado en una prueba")
    .pressButton("",function(){
       assert.ok(browser.success);
       assert.equal(browser.location.pathname, "/posts");
       done();
    });
  });

});
