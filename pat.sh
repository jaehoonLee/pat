
case "$1" in 
    start)
	echo "=========================================Starting PAT Server============================================"
	nohup node app.js &
	LASTPID=$!
	echo $LASTPID > pat.pid
    ;;
    stop)
	echo "=========================================Stoping PAT Server============================================"
	WEBRTCID=$(cat /root/pat/pat.pid)
	echo $WEBRTCID
	kill -9 $WEBRTCID
    ;;
esac
exit 0