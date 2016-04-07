module.exports = function(router) {
	router.get('/', function(req, res, next) {
	  res.render('index');
	});

	router.get('/auth', function(req, res, next) {
	  res.render('auth');
	});
}