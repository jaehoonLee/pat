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

    socket.on('roomLeave', function (data) {
        console.log(data);
    });

    socket.on('roomInfo', function (data) {
        console.log(data);
    });

    socket.on('movePolice', function (data) {
        console.log(data);
    });

    socket.on('moveThief', function (data) {
        console.log(data);
    });

    socket.on('posUpdate', function (data) {
        console.log(data);
    });

    socket.on('catchPlayer', function (data) {
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
    socket.emit('roomMake', {name:"MADMAD", owner:"21025"});
}

function roomEnter(sender_id)
{
    socket.emit('roomEnter', {room_id:"1", sender_id:sender_id});
}

function roomLeave(sender_id)
{
    socket.emit('roomLeave', {room_id:"1", sender_id:sender_id});
}

function movePolice()
{
    socket.emit('movePolice', {room_id:"1", sender_id:"21025"});
}

function moveThief()
{
    socket.emit('moveThief', {room_id:"1", sender_id:"21025"});
}

function posUpdate()
{
    socket.emit('posUpdate', {room_id:"1", longitude:"1", latitude:"1", sender_id:"21025"});
}

function roomInfo()
{
    socket.emit('roomInfo', {room_id:"1"});
}

function catchPlayer()
{
    socket.emit('catchPlayer', {room_id:"1", player_id:"22984", caught_id :"21025"});
}