var express = require('express');
var router = express.Router();

/* GET home page. */
var connection = require("./sql");


module.exports = function(io){
	require("./pages")(router,io);
	
	require("./auth")(router,io,connection);

	require("./users")(router,io,connection);

	require("./profile")(router,io,connection);

	require("./relation")(router,io,connection);

	require("./push")(router,io,connection);

	require("./posts")(router,io,connection);
	
	return router;
}
