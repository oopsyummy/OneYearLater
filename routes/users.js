module.exports = function(router,io,connection) {

	function getUserFromName (name,callback) {

		var query = "SELECT id,name,nickname,thumbnail FROM user WHERE name='" + name + "'";

		console.log(query);

		connection.query(query,function(err,rows){
			if (err) throw err;
			callback(err,rows[0]);
		})
	}

	router.get("/api/get-user-from-name/:name",function(req,res,next){
		getUserFromName(req.params.name,function(err,result){
			if (!result) {res.status(404).end()} else {res.send(result).end()}
		})
	})

}