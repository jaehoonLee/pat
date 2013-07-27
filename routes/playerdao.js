var mysql = require('mysql');
var mysqlConfig = {
    host : "127.0.0.1",
    port : "3306",
    user : "root",
    password : "12341234",
    database : "pat"
};
var conn = mysql.createConnection(mysqlConfig);
module.exports = {
    selectPlayers: function () {

    },
    insertPlayer: function (peopleId, name) {
        conn.query("insert into player (id, name) VALUES ('" + peopleId +"','" + name + "');" , function(err, rows)
        {
            console.log(rows);
        });
    },
    updatePlayer: function(room_id, sender_id, socket, io)
    {
        conn.query("update player set room_id = '" + room_id + "', type = 1 where id ='" + sender_id + "'" , function(err, rows)
        {
            if(err)
            {
                socket.emit('roomEnter', {result : 0});
                console.log(err);
            }else
            {
                socket.emit('roomEnter', {result : 1});
                console.log(rows);

                conn.query("select * from player where room_id = '" + room_id + "'" , function(err, rows)
                {
//                    io.sockets.emit('roomInfo')
                    console.log(rows);
                    io.sockets.in(room_id).emit('roomInfo', {info : rows});
                });
            }
        });
    }
};