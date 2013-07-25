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

//    socket.emit('signup',  {name:"JH"});
//    socket.emit('roomList');
//    socket.emit('roomMake', {name:"MADMAD", owner:"adbdse"});
      socket.emit('roomEnter', {room_id:"1", id:"21025"});
//    socket.emit('roomLeave', {id:"21025"});
});


function plus()
{
    socket.emit('roomEnter', {room_id:"1", id:"21025"});
}

function minus()
{
    socket.emit('roomLeave', {id:"21025"});
}