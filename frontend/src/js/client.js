import io from "socket.io-client";
import * as ClientEvents from "./client-events";
import { toastMessage } from "./utils";

class Client {
	constructor({ name, onConnect }) {
		window.localStorage.setItem("name", name);
		this.name = name;
		this.socket = io();

		this.connectedClients = {};

		this.socket.emit(ClientEvents.JOIN, name);
		this.onConnect = onConnect;
		this.shouldEmit = true;

		this.initializeSocket();
	}

	onConnection() {
		this.onConnect();
		this.id = this.socket.id;
		toastMessage("Use F to toggle fullscreen");
	}

	onClientsEvent(clients) {
		this.connectedClients = clients;
		this.onClients(clients);
	}

	initializeSocket() {
		this.socket.on(ClientEvents.CONNECTION, this.onConnection.bind(this));

		this.socket.on(ClientEvents.SERVER_MESSAGE, (message) => {
			this.addMessage(ClientEvents.SERVER_MESSAGE, null, message);
		});

		this.socket.on(ClientEvents.CLIENT_MESSAGE, (message) => {
			const from =
				message.from === this.socket.id
					? "You"
					: this.connectedClients[message.from];
			this.addMessage(ClientEvents.CLIENT_MESSAGE, from, message.message);
		});

		this.socket.on(ClientEvents.CLIENTS, this.onClientsEvent.bind(this));

		this.socket.on(ClientEvents.PLAY, () => {
			if (this.onPlay) this.onPlay();
			this.shouldEmit = false;
		});

		this.socket.on(ClientEvents.PAUSE, () => {
			if (this.onPause) this.onPause();
			this.shouldEmit = false;
		});

		this.socket.on(ClientEvents.SEEK, (time) => {
			if (this.onSeek) this.onSeek(time);
			this.shouldEmit = false;
		});
	}

	onVideoPlayed() {
		if (this.shouldEmit) {
			this.socket.emit(ClientEvents.PLAY, null);
		}
		this.shouldEmit = true;
	}

	onVideoPaused() {
		if (this.shouldEmit) {
			this.socket.emit(ClientEvents.PAUSE, null);
		}
		this.shouldEmit = true;
	}

	onVideoSeeked(time) {
		if (this.shouldEmit) {
			this.socket.emit(ClientEvents.SEEK, time);
		}
		this.shouldEmit = true;
	}

	setOnMessage(fn) {
		this.onMessage = fn;
	}

	setOnClients(fn) {
		this.onClients = fn;
		fn(this.connectedClients);
	}

	setOnPlay(fn) {
		this.onPlay = fn;
	}

	setOnPause(fn) {
		this.onPause = fn;
	}

	setOnSeek(fn) {
		this.onSeek = fn;
	}

	addMessage(type, from, message) {
		if (this.onMessage) {
			this.onMessage({ type, from, message });
		}
	}

	sendMessage(message) {
		this.socket.emit(ClientEvents.MESSAGE, message);
	}
}

export default Client;
