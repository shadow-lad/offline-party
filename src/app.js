import express from "express";
import { createServer } from "http";
import { config } from "dotenv";
import morgan from "morgan";
import { Server } from "socket.io";

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
		client.emit("server-message", "You have connected to the server");
		client.broadcast.emit("server-message", `${name} has joined the server`);
		io.emit("clients", clients);
	};
}

function onClientPlay(client) {
	return () => {
		client.emit("server-message", "You played the video");
		client.broadcast.emit(
			"server-message",
			`${clients[client.id]} played the video`
		);
		client.broadcast.emit("play");
	};
}

function onClientPause(client) {
	return () => {
		client.emit("server-message", "You paused the video");
		client.broadcast.emit(
			"server-message",
			`${clients[client.id]} paused the video`
		);
		client.broadcast.emit("pause");
	};
}

function onClientSeek(client) {
	return (time) => {
		const seekTime = new Date(time * 1000).toISOString().substr(11, 8);

		client.emit("server-message", `You seeked the video to ${seekTime}`);
		client.broadcast.emit(
			"server-message",
			`${clients[client.id]} seeked the video to ${seekTime}`
		);
		client.broadcast.emit("seek", time);
	};
}

function onClientMessage(client) {
	return (message) => {
		io.emit("client-message", { from: client.id, message });
	};
}

function onClientDisconnect(client) {
	return () => {
		client.broadcast.emit(
			"server-message",
			`${clients[client.id]} has left the server`
		);
		delete clients[client.id];
		io.emit("clients", clients);
	};
}

function onClientConnected(client) {
	client.on("join", onClientJoin(client));

	client.on("play", onClientPlay(client));

	client.on("pause", onClientPause(client));

	client.on("message", onClientMessage(client));

	client.on("seek", onClientSeek(client));

	client.on("disconnect", onClientDisconnect(client));
}

io.on("connection", onClientConnected);

server.listen(PORT, () => {
	console.log("Server started.");
	console.log(`Access Server on port ${PORT}`);
});
