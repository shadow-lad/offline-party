document.body.onload = () => {
	const inputContainer = document.getElementById("inputContainer");
	const videoInput = document.getElementById("videoInput");

	videoInput.addEventListener("change", () => {
		inputContainer.classList.add("hide");
		onVideoLoad(URL.createObjectURL(videoInput.files[0]));
		videoInput.value = "";
		videoInput.files = [];
	});
};

function onVideoLoad(videoURI) {
	const main = document.getElementById("main");
	const video = document.querySelector("video");
	const sendButton = document.getElementById("sendButton");
	const messageInput = document.getElementById("messageInput");
	const messageContainer = document.getElementById("messageContainer");
	const clientsContainer = document.getElementById("clientsContainer");

	main.classList.remove("hide");

	let socket;
	let connectedClients;

	let shouldEmit = true;

	function initializeChat() {
		messageInput.addEventListener("keyup", (event) => {
			if (event.key === "Enter") {
				sendButton.click();
			}
		});

		sendButton.addEventListener("click", () => {
			const message = messageInput.value.trim();
			if (message) {
				messageInput.value = "";
				socket.emit("message", message);
			}
		});
	}

	function initializeVideo() {
		video.src = videoURI;

		video.addEventListener("play", () => {
			if (shouldEmit) {
				socket.emit("play", null);
			}
			shouldEmit = true;
		});

		video.addEventListener("pause", () => {
			if (shouldEmit) {
				socket.emit("pause", null);
			}
			shouldEmit = true;
		});

		video.addEventListener("seeked", () => {
			const time = video.currentTime;
			if (shouldEmit) {
				socket.emit("seek", time);
			}
			shouldEmit = true;
		});
	}

	function addMessage(type, from, message) {
		const div = document.createElement("div");
		div.classList.add(type);
		if (type === "server-message") {
			div.innerText = message;
		} else {
			div.innerHTML = `<p>${from}</p><p>${message}</p>`;
		}
		messageContainer.prepend(div);
	}

	function toastMessage() {
		console.log("start");
		const div = document.createElement("div");
		div.classList.add("toast-message");
		div.innerText = "Use F11 to toggle fullscreen";
		document.body.appendChild(div);
		setTimeout(() => {
			div.remove();
		}, 5000);
	}

	function initializeSocket(name) {
		socket = io();
		socket.emit("join", name);

		socket.on("connect", () => {
			initializeVideo();
			initializeChat();
			toastMessage();
		});

		// handle socket.on Here
		socket.on("server-message", (message) => {
			addMessage("server-message", null, message);
		});

		socket.on("client-message", (message) => {
			const from =
				message.from === socket.id ? "You" : connectedClients[message.from];
			addMessage("client-message", from, message.message);
		});

		socket.on("play", () => {
			video.play();
			shouldEmit = false;
		});

		socket.on("pause", () => {
			video.pause();
			shouldEmit = false;
		});

		socket.on("seek", (time) => {
			video.currentTime = time;
			shouldEmit = false;
		});

		socket.on("clients", (clients) => {
			connectedClients = clients;
			const clientIDs = Object.keys(clients);
			clientsContainer.innerHTML = "";
			clientIDs.forEach((id) => {
				const div = document.createElement("div");
				div.innerText = id === socket.id ? "You" : clients[id];
				clientsContainer.appendChild(div);
			});
		});
	}

	const localStorage = window.localStorage;
	let name = localStorage.getItem("name") || "";

	while (!name) {
		name = prompt("Enter a username");
	}
	localStorage.setItem("name", name);

	initializeSocket(name);
}
