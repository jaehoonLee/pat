var socket = io.connect("http://127.0.0.1:3001/") ;
$(document).ready(function()
{
//    var socket = io.connect("http://jhun88.cafe24.com:3000/") ;
    socket.on('connect', function(){
        console.log("connected");
    });

    socket.on('signup', function (data) {
        console.log(data);
    });

    socket.on('message', function (data) {
        console.log(data);
    });

    socket.on('roomList', function (data) {
        console.log(data);
    });

    socket.on('roomMake', function (data) {
        console.log(data);
    });

    socket.on('roomEnter', function (data) {
        console.log(data);
    });





//    socket.emit('signup',  {name:"JH"});
//    socket.emit('roomList');
//    socket.emit('roomMake', {name:"MADMAD", owner:"adbdse"});
//    socket.emit('roomEnter', {room_id:"1", id:"21025"});
//    socket.emit('roomLeave', {id:"21025"});
});

function signup()
{
    socket.emit('signup',  {name:"JH"});
}

function roomList()
{
    socket.emit('roomList');
}

function roomMake()
{
    socket.emit('roomMake', {name:"MADMAD", owner:"adbdse"});
}

function roomEnter()
{
    socket.emit('roomEnter', {room_id:"1", id:"21025"});
}

function roomLeave()
{
    socket.emit('roomLeave', {id:"21025"});
}