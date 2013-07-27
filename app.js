var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , roomdao = require('./routes/roomdao')
  , playerdao = require('./routes/playerdao');

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

var mysql = require('mysql');
var mysqlConfig = {
    host : "127.0.0.1",
    port : "3306",
    user : "root",
    password : "12341234",
    database : "pat"
};
var conn = mysql.createConnection(mysqlConfig);

//Socket.io
io.sockets.on('connection', function(socket){
    socket.emit('message', {message : 'welcome'});

    socket.on('signup', function(data) {
        var peopleId = parseInt(Math.random() * Math.pow(10,5));
        playerdao.insertPlayer(peopleId, data.name);
        socket.emit('signup', {player_id : peopleId});
    });

    socket.on('roomList', function(data) {
        roomdao.selectRoomsForClient(socket);
    });

    socket.on('roomMake', function(data) {
        roomdao.insertRoom(data.name, data.owner, socket, io);
    });

    socket.on('roomEnter', function(data) {
        playerdao.updatePlayer(data.room_id, data.sender_id, socket, io);
    });

    socket.on('roomLeave', function(data) {
	console.log('===========================roomLeave============================');
	console.log('Data : '+ data.sender_id + " " + data.room_id);
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
                        roomdao.deleteRoom(roomID, io);
                    }
		    console.log('===========================roomLeave============================');
                });
            }
        });
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
    });

    socket.on('roomInfo', function(data) {
	console.log('================================roomInfo ============================');
	socket.join(data.room_id);
        roomdao.updateRoomInfo(data.room_id, io);
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
    console.log("==============================send Roominfo to all rooms===================");
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
    console.log("=====================updateRoomInfo======================");
    console.log("ROOM_ID : " + room_id);
    conn.query("select * from player where room_id = '" + room_id + "'" , function(err, rows)
    {
        console.log("rows: " + rows);
        io.sockets.in(room_id).emit('roomInfo', {info : rows});
    });
}