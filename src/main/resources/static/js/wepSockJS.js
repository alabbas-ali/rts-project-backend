let stompClient;

const connect = () => {
	console.log("Connecting to SockJS");
	var socket = new SockJS('/ws')
	stompClient = Stomp.over(socket)
	stompClient.debug = null
	stompClient.connect({}, (frame) => {
		console.log('Connected: ' + frame)
		stompClient.subscribe('/railway/status', (messageOutput) => {
			update(JSON.parse(messageOutput.body))
		})
	})
}

const disconnect = () => {
	if (stompClient !== null) {
		stompClient.disconnect()
	}
	console.log("Disconnected")
}
