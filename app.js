
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server);

/*
var http = require('http');
var fs = require('fs');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

http.createServer(function(req, res) {
    res.writeHead(200, {'content-type' : 'text/plain'});
    res.end("Hello World!");
}).listen(3000);

console.log("Server running on 3000");
*/

//mysql DB
var mysql = require('mysql');
var mysqlConfig = {
    host : "localhost",
    port : "3306",
    user : "root",
    password : "12341234",
    database : "pat"
};

var conn = mysql.createConnection(mysqlConfig);
conn.query("SELECT * FROM player", function(err, rows)
{
    if(err)
    {
        console.log("MYSQL");
        console.log(err);
    }

    console.log(rows);
});


//Socket.io
io.sockets.on('connection', function(socket){
    console.log("connected");
    socket.emit('message', {message : 'welcome to the chat'});
    socket.on('signin', function(data) {
        var peopleId = parseInt(Math.random() * Math.pow(10,5));
        console.log("insert into player ('id', 'name') VALUES ('" + peopleId +"','" +data.name + "');");
        conn.query("insert into player (id, name) VALUES ('" + peopleId +"','" + data.name + "');" , function(err, rows)
        {
            console.log(rows);
        });
        io.sockets.emit('signin', {player_id : peopleId});
    });

    socket.on('roomList', function(data) {
        peopleId = parseInt(Math.random() * Math.pow(10,10));
        io.sockets.emit('roomList', {room_id : peopleId, name : peopleId , owner : peopleId});
    });

    socket.on('roomEnter', function(data) {
        peopleId = parseInt(Math.random() * Math.pow(10,10));
        io.sockets.emit('roomEnter', {room_status : peopleId});
    });

    socket.on('roomMake', function(data) {
        peopleId = parseInt(Math.random() * Math.pow(10,10));
        io.sockets.emit('roomMake', {room_status : peopleId, room_status : peopleId});
    });
});


//Database
//var mysql = require('db-mysql');
//
//var db = new mysql.Database({
//    hostname:'localhost',
//    user:'root',
//    password:'1234',
//    database:'PAT'
//})
//
//db.connect();
//
//db.on('error', function(error){
//    console.log("CONNECTION ERROR: " + error);
//})
//
//db.on('ready', function(server){
//
//    this.query()
//        .select('*')
//        .from('nodetest2')
//        .where('id = 1')
//        .execute(function(error, rows, columns) {
//            if(error) {
//                return console.log("ERROR:" + error);
//            }
//
//        console.log(rows);
//        console.log(columns);
//        })
//
//    var qry = this.query();
//    qry.execute('select * from nodetest2 wehre id = 1');
//    qry.on('success', function(rows, columns){
//        console.log(rows);
//        console.log(columns);
//    })
//
//    qry.on('error', function(error){
//        console.log('Error:' + error);
//    })
//})
