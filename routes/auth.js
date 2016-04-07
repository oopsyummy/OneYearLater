var uuid = require('node-uuid');

module.exports=function(router,io,connection) {
    router.post('/login',function(req,res,next){
        connection.query('SELECT * FROM user WHERE name = "' + req.body.userinfo +'" OR email ="'+req.body.userinfo+'"', function(err, rows, fields) {
          if (err) throw err;
          if (rows.length == 0) {
            res.status(404).end();
          }
          else {
            if (rows[0].password == req.body.password) {
                var session = uuid.v4();
                var updateSessionQuery = 'UPDATE user SET session="'+ session + '" WHERE id="' + rows[0].id + '"';
                connection.query(updateSessionQuery,function(err){
                    if (err) throw err;
                    // remember to change the session
                    rows[0].session = session;
                    res.send(rows[0]).end();

                    if (req.body.socket && io.sockets.connected["/#"+req.body.socket]) {
                    // Join the socket to id room
                        io.sockets.connected["/#"+req.body.socket].join(rows[0].id);
                    }
                });
            }
            else {
                res.status(400).end();
            }
          }
        });
    });

    router.post('/auth',function(req,res,next){
        connection.query('SELECT * FROM user WHERE id = "' + req.body.id +'" AND session ="'+req.body.session+'"', function(err, rows, fields) {
            if (err) throw err;
            if (rows.length == 0) {
                res.status(404).end();
            }
            else {
                res.send(rows[0]).end();

                // Get it join socket room

                //console.log(io.sockets.connected["/#"+req.body.socket]);
                if (req.body.socket && io.sockets.connected["/#"+req.body.socket]) {
                    io.sockets.connected["/#"+req.body.socket].join(rows[0].id);
                }
            }
        });
    });

    router.post('/oauth',function(req,res,next){
        // Query whether the id is existed

        var profile = req.body.profile;

        // 
        var existQuery = 'SELECT * FROM user WHERE ' + req.body.channel + '="' + profile.id +'"';
        console.log(existQuery);
        connection.query(existQuery, function(err, rows, fields) {

            if (err) throw err;
            if (rows.length == 0) {
            // id not existed, create one
                var userid = uuid.v4();
                var session = uuid.v4();

                connection.query('INSERT INTO user (id,name,email,session,'+ req.body.channel +') VALUES ("'+ userid +'","' + profile.name +'","' + profile.email + '","' + session + '","' + profile.id +'")',function(err,rows,fileds){
                    //console.log(rows);
                    if (err) throw err;
                    res.send({
                        id:userid,
                        session:session,
                        name:profile.name,
                        email:profile.email
                    }).end();

                    if (req.body.socket && io.sockets.connected["/#"+req.body.socket]) {
                        io.sockets.connected["/#"+req.body.socket].join(userid);
                    }
                })
            }
            else {
            // id existed, return the user and change the session
                var session = uuid.v4();
                var updateSessionQuery = 'UPDATE user SET session="'+ session + '" WHERE id="' + rows[0].id + '"';
                
                console.log(updateSessionQuery);

                connection.query(updateSessionQuery,function(err){
                    if (err) throw err;
                    // remember to change the session
                    rows[0].session = session;
                    res.send(rows[0]).end();

                    if (req.body.socket && io.sockets.connected["/#"+req.body.socket]) {
                        io.sockets.connected["/#"+req.body.socket].join(rows[0].id);
                    }
                });
            };
        });
    });
}