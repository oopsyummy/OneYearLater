module.exports = function(router,io,connection) {

	function getDashboardPosts (id,session,callback) {

		// 1. Check id and session

		connection.query("SELECT * FROM user WHERE id=?",[id],function(err,rows){
			if (err) throw err;
			if (rows[0] && rows[0].session == session) {

				// 2. Get Following Posts
				// 3. Get your own posts

				var query = "SELECT posts.id,posts.user_id,user.name,user.nickname,user.thumbnail,posts.text,posts.created_at,images.image_id,images.image_url," +
				"(SELECT COUNT(*) FROM posts_likes WHERE user_id='" + id + "' AND post_id=posts.id) AS liked, "+
				"(SELECT COUNT(*) FROM posts_likes WHERE post_id=posts.id) AS likes "+
				"FROM posts " +
				"JOIN user ON (user.id = posts.user_id) " +
				"LEFT JOIN images ON (images.post_id = posts.id) " +
				"WHERE posts.user_id = '"+id+"' OR posts.user_id in (SELECT followings.following_id FROM followings WHERE followings.user_id = '"+id+"') " +
				"order by posts.created_at DESC limit 5"

				// console.log(query);

				connection.query(query,function(err,rows){
					callback(err,rows);
				})

			}
			else {
				callback(err);
			}
		})


	}

	function getAllPostsFromName (id,name,callback) {

		var query = "SELECT posts.id,posts.user_id,user.name,user.nickname,user.thumbnail,posts.text,posts.created_at,images.image_id,images.image_url," +

		"(SELECT COUNT(*) FROM posts_likes WHERE user_id='" + id + "' AND post_id=posts.id) AS liked, "+

		"(SELECT COUNT(*) FROM posts_likes WHERE post_id=posts.id) AS likes " +

		"FROM posts " +

		"LEFT JOIN images ON (images.post_id = posts.id) " +

		"INNER JOIN user ON (user.id = posts.user_id) " +

		"WHERE posts.user_id=(SELECT id FROM user WHERE name='" + name +"')" +

		"order by posts.created_at DESC limit 5";

		// console.log(query);

		connection.query(query,function(err,rows){
			if (err) throw err;
			callback(err,rows);
		})
	}

	function getAllPostsFromTagName (id,name,callback) {

		var query = "SELECT posts.id,posts.user_id,user.name,user.nickname,user.thumbnail,posts.text,posts.created_at,images.image_id,images.image_url," +

		"(SELECT COUNT(*) FROM posts_likes WHERE user_id='" + id + "' AND post_id=posts.id) AS liked, "+

		"(SELECT COUNT(*) FROM posts_likes WHERE post_id=posts.id) AS likes " +

		"FROM posts " +

		"LEFT JOIN images ON (images.post_id = posts.id) " +

		"INNER JOIN user ON (user.id = posts.user_id) " +

		"WHERE posts.id in (SELECT post_id FROM posts_tags WHERE tag_id = (SELECT id FROM tags WHERE name='" + name +"'))" +

		"order by posts.created_at DESC limit 5";

		connection.query(query,function(err,rows){
			if (err) throw err;
			callback(err,rows);
		})
	}

	function likePost(user_id,post_id,callback) {
		var query = "INSERT INTO posts_likes (user_id,post_id) VALUES ('"+user_id+"','"+post_id+"')";
		console.log(query);
		connection.query(query,function(err,rows){
			if (err) throw err;
			callback(err,rows);
		})
	}

	function unlikePost(user_id,post_id,callback) {
		var query = "DELETE FROM posts_likes WHERE user_id='"+user_id+"' AND post_id='"+post_id+"'";
		connection.query(query,function(err,rows){
			if (err) throw err;
			callback(err,rows);
		})
	}

	function checkLikePost(user_id,post_id,callback) {
		var query = "SELECT 1 FROM posts_likes WHERE user_id='"+user_id+"' AND post_id='"+post_id+"'";
		connection.query(query,function(err,rows){
			if (err) throw err;
			var likeBool = (rows.length == 0) ? false : true;
			callback(err,likeBool);
		})
	}

	function getRepliesFromPostId (id,callback) {
		var query = "SELECT replies.id,replies.text,replies.created_at,user.name,replies.user_id FROM replies " +

		"INNER JOIN user ON (user.id = replies.user_id) " +

		"WHERE replies.post_id="+id+" " +

 		"order by replies.created_at limit 10"

 		connection.query(query,function(err,rows){
			if (err) {
				console.log(err);
				throw err;
			};
			callback(err,rows);
		})
 	}

 	function replyToPost (post_id,user_id,text,callback) {
		var query = "INSERT INTO replies (post_id,user_id,text,created_at) VALUES ('"+post_id+"','"+user_id+"','"+text+"',"+connection.escape(new Date())+")"

		console.log(query);

 		connection.query(query,function(err,result){
			if (err) {
				console.log(err);
				throw err;
			};
			callback(err,result);
		})
 	}

 	function deleteReply(reply_id,user_id,callback) {
		var query = "DELETE FROM replies WHERE user_id='"+user_id+"' AND id='"+reply_id+"'";
		connection.query(query,function(err,result){
			if (err) throw err;
			callback(err,result);
		})
	}

	router.post("/api/get-dashboard-posts",function(req,res,next){
		getDashboardPosts(req.body.id,req.body.session,function(err,result){
			if (err) {
				console.log(err);
			}
			if (result) {
				res.send(result).end();
			}
			else {
				res.status(403).end();
			}
		})
	})

	router.post("/api/get-all-posts-from-name",function(req,res,next){
		getAllPostsFromName(req.body.user_id,req.body.name,function(err,result){
			res.send(result).end();
		})
	})

	router.post("/api/get-all-posts-from-tag-name",function(req,res,next){
		getAllPostsFromTagName(req.body.user_id,req.body.name,function(err,result){
			res.send(result).end();
		})
	})

	router.post("/api/like-post",function(req,res,next){
		likePost(
			req.body.user_id,
			req.body.post_id,
			function(err,result){
			if (err) {res.status(404).end} else {res.status(200).end()}
		})
	})

	router.post("/api/unlike-post",function(req,res,next){
		unlikePost(
			req.body.user_id,
			req.body.post_id,
			function(err,result){
			if (err || result.affectedRows == 0) {res.status(404).end} else {res.status(200).end()}
		})
	})

	router.post("/api/check-like-post",function(req,res,next){
		unlikePost(
			req.body.user_id,
			req.body.post_id,
			function(err,result){
			if (err) {res.status(404).end} else {res.send(result).end()}
		})
	})

	router.get("/api/get-replies-from-post-id/:id",function(req,res,next){
		getRepliesFromPostId(req.params.id,function(err,result){
			res.send(result).end();
		})
	})

	router.post("/api/reply-to-post",function(req,res,next){
		replyToPost(req.body.post_id,req.body.user_id,req.body.text,function(err,result){
			if (err) {res.status(404).end} else {res.send(result).end()}
		})
	})

	router.post("/api/delete-reply",function(req,res,next){
		deleteReply(req.body.reply_id,req.body.user_id,function(err,result){
			if (err || result.affectedRows == 0) {res.status(404).end} else {res.status(200).end()}
		})
	})

}
