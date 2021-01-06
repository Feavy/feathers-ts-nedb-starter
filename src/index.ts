import feathers from "@feathersjs/feathers";
import "@feathersjs/transport-commons";
import express from "@feathersjs/express";
import socketio from "@feathersjs/socketio";
import NeDB from "nedb";
import service from "feathers-nedb";

import { Application } from './declarations';

// This is the interface for the message data
interface Message {
	text: string;
}

// A messages NeDB service that allows to create new
const MessageModel = new NeDB<Message>({
	filename: './db/messages.db',
	autoload: true
});

const PORT = 8080;

// Creates an ExpressJS compatible Feathers application
const app: Application = express(feathers());

// Express middleware to parse HTTP JSON bodies
app.use(express.json());
// Express middleware to parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Express middleware to to host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// // Register our messages service
app.use("/messages", service({ Model: MessageModel }));
// Express middleware with a nicer error handler
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on("connection", (connection) => app.channel("everybody").join(connection));
// Publish all events to the `everybody` channel
app.publish((data) => app.channel("everybody"));

// Start the server
app.listen(PORT)
	.on("listening", () =>
		console.log(`Feathers server listening on localhost:${PORT}`)
	);

app.service("messages").create({
	text: "Hello world from the server"
});

MessageModel.find({}, function (err, docs) {
	console.log("Existing messages")
	console.log(docs);
});
