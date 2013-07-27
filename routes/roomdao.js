var mysql = require('mysql');
var mysqlConfig = {
    host : "127.0.0.1",
    port : "3306",
    user : "root",
    password : "12341234",
    database : "pat"
};
var conn = mysql.createConnection(mysqlConfig);
var roomDao = require('./roomdao')

module.exports = {
    selectRooms: function (io) {
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
    },
    selectRoomsForClient: function (socket) {
        console.log("======================selectRoomsForClient=========================");
        conn.query("select * from room" , function(err, rows)
        {
            var roomRows = rows;
            if(roomRows.length == 0)
            {
                socket.emit('roomList', {rooms : []});
                return;
            }

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
    },
    insertRoom : function(name, owner, socket, io)
    {
        conn.query("insert into room (name, owner) VALUES ('" + name +"','" + owner + "');" , function(err, rows)
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
                conn.query("update player set room_id = '" + roomId + "', type = 1 where id ='" + owner + "'" , function(err, rows)
                {
                    if(err)
                    {

                    }else
                    {
                        module.exports.updateRoomInfo(roomId, io);
                        module.exports.selectRooms(io);
                    }
                });
            }
        });
    },
    deleteRoom: function (room_id, io) {
        conn.query("delete from room where id = '" + room_id + "'" , function(err, rows)
        {
            if(err)
            {

            }else
            {
                module.exports.selectRooms(io);
            }
        });
    },
    updateRoomInfo: function (room_id, io) {
        console.log("=====================updateRoomInfo======================");
        console.log("ROOM_ID : " + room_id);
        conn.query("select * from player where room_id = '" + room_id + "'" , function(err, rows)
        {
            var players = rows;
            conn.query("select owner from room where id = '" + room_id + "'", function(err, rows)
            {
                if(rows.length != 0)
                console.log("rows: " + rows[0].owner);
                io.sockets.in(room_id).emit('roomInfo', {info : players, owner : rows[0].owner});
            });
        });
    }
};