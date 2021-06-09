import * as ClientEvents from "./client-events";
import VideoPlayer from "./video-player";
import Client from "./client";

class MainContainer {
	constructor(videoURL) {
		this.container = document.getElementById("main");
		this.sendButton = document.getElementById("sendButton");
		this.messageInput = document.getElementById("messageInput");
		this.messageContainer = document.querySelector(".message-container");
		this.clientsContainer = document.querySelector(".clients-container");

		let name = window.localStorage.getItem("name") || "";

		while (!name) {
			name = prompt("Enter a username");
		}

		this.container.classList.remove("hide");

		this.client = new Client({
			name,
			onConnect: () => this.initializeListeners(videoURL),
		});
	}

	appendMessage({ type, from, message }) {
		const div = document.createElement("div");
		div.classList.add(type);
		if (type === ClientEvents.SERVER_MESSAGE) div.innerText = message;
		else div.innerHTML = `<p>${from}</p><p>${message}</p>`;
		this.messageContainer.prepend(div);
	}

	setClients(clients) {
		const clientIDs = Object.keys(clients);
		this.clientsContainer.innerHTML = "";
		clientIDs.forEach((id) => {
			const div = document.createElement("div");
			div.innerHTML = id === this.client.id ? "You" : clients[id];
			this.clientsContainer.appendChild(div);
		});
	}

	initializeChat() {
		this.messageInput.addEventListener(
			"keyup",
			(event) => event.key === "Enter" && this.sendButton.click()
		);

		this.sendButton.addEventListener("click", () => {
			console.log("clicked");
			const message = this.messageInput.value.trim();
			if (!message) return;
			this.messageInput.value = "";
			this.client.sendMessage(message);
		});
	}

	initializeClient() {
		this.client.setOnMessage(this.appendMessage.bind(this));
		this.client.setOnClients(this.setClients.bind(this));
		this.client.setOnPlay(() => this.videoPlayer.playVideo());
		this.client.setOnPause(() => this.videoPlayer.pauseVideo());
		this.client.setOnSeek((time) => this.videoPlayer.seekTo(time));
	}

	initializeVideoPlayer() {
		this.videoPlayer.setOnPlay(() => this.client.onVideoPlayed());
		this.videoPlayer.setOnPause(() => this.client.onVideoPaused());
		this.videoPlayer.setOnSeek((time) => this.client.onVideoSeeked(time));
	}

	initializeListeners(videoURL) {
		this.videoPlayer = new VideoPlayer(videoURL);
		this.initializeChat();
		this.initializeVideoPlayer();
		this.initializeClient();
	}
}

export default MainContainer;
