var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'moeritherium.cw63snoq2i5l.ap-northeast-1.rds.amazonaws.com',
  user     : 'root',
  password : 'Moerit2016',
  database : 'moeritherium-web',
  timezone : '+0800'
});
connection.connect();

module.exports = connection;