$(document).ready(function()
{
    var socket = io.connect("http://127.0.0.1:3001/") ;
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

    socket.emit('signup',  {name:"JH"});
    socket.emit('roomList',  {name:"JH"});
});