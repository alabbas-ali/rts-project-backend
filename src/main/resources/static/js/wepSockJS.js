let stompClient;

const connect = () => {
	console.log("Connecting to SockJS");
	var socket = new SockJS('/ws')
	stompClient = Stomp.over(socket)
	stompClient.debug = null
	stompClient.connect({}, (frame) => {
		console.log('Connected: ' + frame)
		stompClient.subscribe('/railway/status', (messageOutput) => {
			const massage = JSON.parse(messageOutput.body)
			//console.log(massage)
			if(massage.status === "SUCCESS") 
				update(JSON.parse(massage.result))
		})
	})
}

const disconnect = () => {
	if (stompClient !== null) {
		stompClient.disconnect()
	}
	console.log("Disconnected")
}
