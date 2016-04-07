module.exports = function(router,io,connection) {
	// Logic of getting friends, become friends

	function getRelationStat (id,callback) {

		var query = "SELECT " +
		"(SELECT COUNT(*) FROM followings WHERE `user_id`='" + id + "') as followings," +
		"(SELECT COUNT(*) FROM followings WHERE `following_id`='" + id + "') as followers," +
		"(SELECT COUNT(*) FROM posts WHERE `user_id`='" + id + "') as posts";

		// console.log(query);

		connection.query(query,function(err,rows){
			if (err) throw err;
			callback(err,rows[0]);
		})
	}

	function getAllFollowings (id,callback) {
		connection.query("SELECT user.id,user.name,user.nickname,user.thumbnail FROM user INNER JOIN followings ON followings.following_id = user.id WHERE followings.user_id=?",[id],function(err,rows){
			callback(err,rows);
		})
	}

	function getAllFollowingsFromName (name,callback) {
		connection.query("SELECT id FROM user WHERE name=?",[name],function(err,rows){
			connection.query("SELECT user.id,user.name,user.nickname,user.thumbnail FROM user INNER JOIN followings ON followings.following_id = user.id WHERE followings.user_id=?",[rows[0].id],function(err,rows){
				callback(err,rows);
			})
		})
	}

	function getAllFollowers (id,callback) {
		connection.query("SELECT user.id,user.name,user.nickname,user.thumbnail FROM user INNER JOIN followings ON followings.user_id = user.id WHERE followings.following_id=?",[id],function(err,rows){
			callback(err,rows);
		})
	}

	function getAllFollowersFromName (name,callback) {
		connection.query("SELECT id FROM user WHERE name=?",[name],function(err,rows){
			connection.query("SELECT user.id,user.name,user.nickname,user.thumbnail FROM user INNER JOIN followings ON followings.user_id = user.id WHERE followings.following_id=?",[rows[0].id],function(err,rows){
				callback(err,rows);
			})
		})
	}

	function checkFollowing(user_id,following_id,callback) {
		connection.query("SELECT * FROM followings WHERE user_id='"+user_id+"' AND following_id='"+following_id+"'",function(err,rows){
			if (err) throw err;
			if (rows && rows.length != 0) {
				callback(err,true);
			}
			else {
				callback(err,false);
			}

		})
	}

	function follow(user_id,following_id,callback){
		connection.query("INSERT INTO followings (user_id,following_id) VALUES ('"+user_id+"','"+following_id+"')",function(err){
			if (err) throw err;
			callback(err);
		})
	}

	function unfollow(user_id,following_id,callback){
		connection.query("DELETE FROM followings WHERE user_id='" + user_id +"' AND following_id='"+ following_id +"'",function(err){
			if (err) throw err;
			callback(err);
		})
	}

	router.get("/api/get-relation-stat/:id",function(req,res,next){
		getRelationStat(req.params.id,function(err,followings){
			res.send(followings).end();
		})
	})

	router.get("/api/get-all-followings/:id",function(req,res,next){
		getAllFollowings(req.params.id,function(err,followings){
			res.send(followings).end();
		})
	})

	router.get("/api/get-all-followings-from-name/:name",function(req,res,next){
		getAllFollowingsFromName(req.params.name,function(err,followings){
			res.send(followings).end();
		})
	})

	router.get("/api/get-all-followers/:id",function(req,res,next){
		getAllFollowers(req.params.id,function(err,followers){
			res.send(followers).end();
		})
	})

	router.get("/api/get-all-followers-from-name/:name",function(req,res,next){
		getAllFollowersFromName(req.params.name,function(err,followers){
			res.send(followers).end();
		})
	})

	router.post("/api/check-following",function(req,res,next){
		checkFollowing(req.body.user_id,req.body.following_id,function(err,result){
			if (result) {res.status(200).end()} else {res.status(404).end};
		})
	})

	router.post("/api/follow",function(req,res,next){
		follow(req.body.user_id,req.body.following_id,function(err){
			if (err) {res.status(404).end} else {res.status(200).end()}
		})
	})

	router.post("/api/unfollow",function(req,res,next){
		unfollow(req.body.user_id,req.body.following_id,function(err){
			if (err) {res.status(404).end} else {res.status(200).end()}
		})
	})
}
