
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
    socket.emit('message', {message : 'welcome'});

    //Sign in
    socket.on('signup', function(data) {
        var peopleId = parseInt(Math.random() * Math.pow(10,5));
        conn.query("insert into player (id, name) VALUES ('" + peopleId +"','" + data.name + "');" , function(err, rows)
        {
            console.log(rows);
        });
        socket.emit('signup', {player_id : peopleId});
    });

    //Room
    socket.on('roomList', function(data) {
        selectRoomsForClient(socket);
    });

    socket.on('roomMake', function(data) {
        conn.query("insert into room (name, owner) VALUES ('" + data.name +"','" + data.owner + "');" , function(err, rows)
        {
            if(err)
            {
                socket.emit('roomMake', {result : 0});
            }else
            {
                //join socket in group
                var roomId = rows.insertId;
                socket.join(rows.insertId);
                socket.emit('roomMake', {result : 1, room_id:rows.insertId});
                conn.query("update player set room_id = '" + roomId + "', type = 1 where id ='" + data.owner + "'" , function(err, rows)
                {
                    if(err)
                    {

                    }else
                    {
                        socket.emit('roomInfo', {info : rows});
                        selectRooms();
                    }
                });
            }
        });
    });

    socket.on('roomEnter', function(data) {

        conn.query("update player set room_id = '" + data.room_id + "', type = 1 where id ='" + data.sender_id + "'" , function(err, rows)
        {
            if(err)
            {
                socket.emit('roomEnter', {result : 0});
                console.log(err);
            }else
            {
                socket.emit('roomEnter', {result : 1});
                console.log(rows);

                socket.join(data.room_id);

                conn.query("select * from player where room_id = '" + data.room_id + "'" , function(err, rows)
                {
//                    io.sockets.emit('roomInfo')
                    console.log(rows);
                    io.sockets.in(data.room_id).emit('roomInfo', {info : rows});
                });
            }
        });
        //update Room Member

//        var playerList = socketMap.get(data.room_id);
//        if(typeof playerList == 'undefined')
//            socketMap.set(data.room_id, [{id : data.sender_id, socket: socket}]);
//        else
//            playerList.push({id : data.sender_id, socket: socket});
//
//        playerList = socketMap.get(data.room_id);
//        console.log(playerList);

        //Send Room Change

    });

    socket.on('roomLeave', function(data) {
        conn.query("update player set type = 0, room_id = '-1" + "' where id ='" + data.sender_id + "'" , function(err, rows)
        {
            if(err)
            {
                socket.emit('roomLeave', {result : 0});
                console.log(err);
            }else
            {
                var roomID = data.room_id;
                socket.emit('roomLeave', {result : 1});
                socket.leave(data.room_id);

                conn.query("select * from player where room_id = '" + roomID  + "'" , function(err, rows)
                {
//                    io.sockets.emit('roomInfo')
                    console.log(rows);
                    if(rows.length != 0)
                    {
                        io.sockets.in(roomID).emit('roomInfo', {info : rows});
                    }else{
//                        console.log("delete==============================================>")
                        deleteRoom(roomID);
                    }
                });
            }
        });

        //update Room Member
//        var playerList = socketMap.get(data.room_id);
//        if(typeof playerList == 'undefined')
//            return;
//        else
//        {
//            for(var i=0; i<playerList.length; i++)
//            {
//                if(playerList[i].id == data.sender_id)
//                {
//                    playerList.splice(i, 1);
//                }
//            }
//        }
//
//        playerList = socketMap.get(data.room_id);
//        console.log(playerList);
    });

    socket.on('movePolice', function(data) {
        conn.query("update player set type = 1" + " where id ='" + data.sender_id + "'" , function(err, rows)
        {
            if(err)
            {
                socket.emit('movePolice', {result : 0});
                console.log(err);
            }else
            {
                console.log(rows);
                socket.emit('movePolice', {result : 1});

                updateRoomInfo(data.room_id);
            }
        });

        //
//        io.sockets.emit('movePolice', {room_status : peopleId, room_status : peopleId});
    });

    socket.on('moveThief', function(data) {
        conn.query("update player set type = 2" + " where id ='" + data.sender_id + "'" , function(err, rows)
        {
            if(err)
            {
                socket.emit('moveThief', {result : 0});
                console.log(err);
            }else
            {
                console.log(rows);
                socket.emit('moveThief', {result : 1});

                updateRoomInfo(data.room_id);
            }
        });
//        io.sockets.emit('moveThief', {room_status : peopleId, room_status : peopleId});
    });

    socket.on('roomInfo', function(data) {
        updateRoomInfo(data.room_id);
//        io.sockets.emit('moveThief', {room_status : peopleId, room_status : peopleId});
    });

    socket.on('posUpdate', function(data) {
        conn.query("update player set longitude = " + data.longitude + ", latitude = " + data.latitude +  " where id ='" + data.sender_id + "'" , function(err, rows)
        {
            if(err)
            {
                socket.emit('posUpdate', {result : 0});
                console.log(err);
            }else
            {
                console.log(rows);
                socket.emit('posUpdate', {result : 1});


                conn.query("select * from player where room_id = '" + data.room_id + "'" , function(err, rows)
                {
                    io.sockets.in(data.room_id).emit('roomInfo', {info : rows});
                });
            }
        });
    });

    socket.on('catchPlayer', function(data) {

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


function selectRooms()
{
    conn.query("select * from room" , function(err, rows)
    {
        var roomRows = rows;
        console.log(roomRows);
        console.log(roomRows[0]);

        var index = 0;
        for(var i in roomRows)
        {
            var roomRow = roomRows[i];

            conn.query("select * from player where id='"  + roomRow.owner + "'", function(err, rows)
            {
                index++;
                if(err)
                {

                }
                else
                {
                    if(rows.length == 1)
                    {
                        roomRows[index - 1].owner = rows[0].name;
                    }

                    if(index == roomRows.length)
                    {
                        io.sockets.emit('roomList', {rooms : roomRows});
                    }
                }
            });
        }
    });
}


function selectRoomsForClient(socket)
{
    conn.query("select * from room" , function(err, rows)
    {
        var roomRows = rows;
        console.log(roomRows);
        console.log(roomRows[0]);

        var index = 0;
        for(var i in roomRows)
        {
            var roomRow = roomRows[i];

            conn.query("select * from player where id='"  + roomRow.owner + "'", function(err, rows)
            {
                index++;
                if(err)
                {

                }
                else
                {
                    if(rows.length == 1)
                    {
                        roomRows[index - 1].owner = rows[0].name;
                    }

                    if(index == roomRows.length)
                    {
                        socket.emit('roomList', {rooms : roomRows});
                    }
                }
            });
        }
    });
}

function deleteRoom(room_id)
{
    conn.query("delete from room where id = '" + room_id + "'" , function(err, rows)
    {
        if(err)
        {

        }else
        {
            selectRooms();
        }
    });
}

function updateRoomInfo(room_id)
{
    conn.query("select * from player where room_id = '" + room_id + "'" , function(err, rows)
    {
        io.sockets.in(room_id).emit('roomInfo', {info : rows});
    });
}