/**
 * Created with JetBrains WebStorm.
 * User: user
 * Date: 13. 7. 13
 * Time: 오후 3:32
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function ()
{
    var socket = io.connect("http://127.0.0.1:3000/") ;
//    var socket = io.connect("http://jhun88.cafe24.com:3000/") ;
    socket.on('chatSync', function (data) {
        console.log(data);
        for (var i = 0 ; i < data.chatArr.length; i++)
        {
            var name = data.chatArr[i].name
            var message = data.chatArr[i].message
            $('.chat').append(name + " : " + message + '</br>')
        }
    });

    socket.on('connect', function()
    {
        console.log("connected");
    });

    socket.on('message', function(data)
    {
        var name = data.name ;
        if(name == null)
            $('.chat').append(data.message + '</br>')
        else
            $('.chat').append(name + " : " + data.message + '</br>')

        var elem = document.getElementById('chat');
        elem.scrollTop = elem.scrollHeight;
        $('.content').val('');
    });

    $('.sendBtn').click(function()
    {
        var message = $('.content').val();
        var name = $('.name').val();
        if(name == '')
            name = "익명"

        $('.chat').append(name + " : " + message + '</br>')
        socket.emit('message', {
            name : name,
            message : message
        });

        var elem = document.getElementById('chat');
        elem.scrollTop = elem.scrollHeight;
        $('.content').val('');
    });

    $(".content").keypress(function(e){
        console.log('H');
        if(e.keyCode==13)
            $('.sendBtn').click();
    });
});

function chat()
{
    alert('a');
}