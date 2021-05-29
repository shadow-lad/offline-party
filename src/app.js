import express from "express";
import { createServer } from "http";
import { config } from "dotenv";
import morgan from "morgan";
import { Server } from "socket.io";
import * as SocketEvents from "./socketEvents.js";

config(); // dotenv config

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

const clients = {};

app.use(express.static("public"));

function onClientJoin(client) {
	return (name) => {
		clients[client.id] = name;
		client.emit(
			SocketEvents.SERVER_MESSAGE,
			"You have connected to the server"
		);
		client.broadcast.emit(
			SocketEvents.SERVER_MESSAGE,
			`${name} has joined the server`
		);
		io.emit(SocketEvents.CLIENTS, clients);
	};
}

function onClientPlay(client) {
	return () => {
		client.emit(SocketEvents.SERVER_MESSAGE, "You played the video");
		client.broadcast.emit(
			SocketEvents.SERVER_MESSAGE,
			`${clients[client.id]} played the video`
		);
		client.broadcast.emit(SocketEvents.PLAY);
	};
}

function onClientPause(client) {
	return () => {
		client.emit(SocketEvents.SERVER_MESSAGE, "You paused the video");
		client.broadcast.emit(
			SocketEvents.SERVER_MESSAGE,
			`${clients[client.id]} paused the video`
		);
		client.broadcast.emit(SocketEvents.PAUSE);
	};
}

function onClientSeek(client) {
	return (time) => {
		const seekTime = new Date(time * 1000).toISOString().substr(11, 8);

		client.emit(
			SocketEvents.SERVER_MESSAGE,
			`You seeked the video to ${seekTime}`
		);
		client.broadcast.emit(
			SocketEvents.SERVER_MESSAGE,
			`${clients[client.id]} seeked the video to ${seekTime}`
		);
		client.broadcast.emit(SocketEvents.SEEK, time);
	};
}

function onClientMessage(client) {
	return (message) => {
		io.emit(SocketEvents.CLIENT_MESSAGE, { from: client.id, message });
	};
}

function onClientDisconnect(client) {
	return () => {
		client.broadcast.emit(
			SocketEvents.SERVER_MESSAGE,
			`${clients[client.id]} has left the server`
		);
		delete clients[client.id];
		io.emit(SocketEvents.CLIENTS, clients);
	};
}

function onClientConnected(client) {
	client.on(SocketEvents.JOIN, onClientJoin(client));

	client.on(SocketEvents.PLAY, onClientPlay(client));

	client.on(SocketEvents.PAUSE, onClientPause(client));

	client.on(SocketEvents.MESSAGE, onClientMessage(client));

	client.on(SocketEvents.SEEK, onClientSeek(client));

	client.on(SocketEvents.DISCONNECT, onClientDisconnect(client));
}

io.on(SocketEvents.CONNECTION, onClientConnected);

server.listen(PORT, () => {
	console.log("Server started.");
	console.log(`Access Server on port ${PORT}`);
});
