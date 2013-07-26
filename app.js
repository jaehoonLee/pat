
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
app.set('port', process.env.PORT || 3001);
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
    host : "127.0.0.1",
    port : "3306",
    user : "root",
    password : "12341234",
    database : "pat"
};

var conn = mysql.createConnection(mysqlConfig);
conn.query("SELECT * FROM room", function(err, rows)
{
    if(err)
    {
        console.log("MYSQL");
        console.log(err);
    }

    console.log(rows);
});


//Socket.io
var HashMap = require('hashmap').HashMap;
var socketMap = new HashMap();

io.sockets.on('connection', function(socket){
    console.log("connected");
    socket.emit('message', {message : 'welcome'});

    //Sign in
    socket.on('signup', function(data) {
        console.log("ROOMLIST");
        var peopleId = parseInt(Math.random() * Math.pow(10,5));
        conn.query("insert into player (id, name) VALUES ('" + peopleId +"','" + data.name + "');" , function(err, rows)
        {
            console.log(rows);
        });
        io.sockets.emit('signup', {player_id : peopleId});
    });

    //Room
    socket.on('roomList', function(data) {
        conn.query("select * from room" , function(err, rows)
        {
            console.log(rows);
            io.sockets.emit('roomList', {rooms : rows});
        });
    });

    socket.on('roomMake', function(data) {
        conn.query("insert into room (name, owner) VALUES ('" + data.name +"','" + data.owner + "');" , function(err, rows)
        {
            if(err)
            {
                io.sockets.emit('roomMake', {result : 0});
                console.log(err);
            }else
            {
                io.sockets.emit('roomMake', {result : 1, room_id:rows.insertId});
                console.log(rows);
            }
        });
    });

    socket.on('roomEnter', function(data) {

        conn.query("update player set room_id = '" + data.room_id + "' where id ='" + data.id + "'" , function(err, rows)
        {
            if(err)
            {
                io.sockets.emit('roomEnter', {result : 0});
                console.log(err);
            }else
            {
                io.sockets.emit('roomEnter', {result : 1});
                console.log(rows);
            }
        });

        //update Room Member
        var playerList = socketMap.get(data.room_id);
        if(typeof playerList == 'undefined')
            socketMap.set(data.room_id, [data.id]);
        else
            playerList.push(data.id);

        playerList = socketMap.get(data.room_id);
        console.log(playerList);
    });

    socket.on('roomLeave', function(data) {
        conn.query("update player set room_id = '-1" + "' where id ='" + data.id + "'" , function(err, rows)
        {
            if(err)
            {
                io.sockets.emit('roomLeave', {result : 0});
                console.log(err);
            }else
            {
                io.sockets.emit('roomLeave', {result : 1});
                console.log(rows);
            }
        });

        //update Room Member
        var playerList = socketMap.get(data.room_id);
        if(typeof playerList == 'undefined')
            return;
        else
        {
            for(var i=0; i<playerList.length; i++)
            {
                if(playerList[i] == data.id)
                {
                    playerList.splice(i, 1);
                }
            }
        }

        playerList = socketMap.get(data.room_id);
        console.log(playerList);
    });

    socket.on('roomPolice', function(data) {
        peopleId = parseInt(Math.random() * Math.pow(10,10));
        io.sockets.emit('roomMake', {room_status : peopleId, room_status : peopleId});
    });

    socket.on('roomThief', function(data) {
        peopleId = parseInt(Math.random() * Math.pow(10,10));
        io.sockets.emit('roomMake', {room_status : peopleId, room_status : peopleId});
    });


   //Map
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
