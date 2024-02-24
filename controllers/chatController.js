const Message = require("../models/message");

module.exports = (io) => {
	
	io.on("connection", (client) => {
		client.broadcast.emit("user connected");	
		client.on("disconnect", () => {
			client.broadcast.emit("user disconnected");
		});
	
	// Listener for custom event "message"
	client.on("message", (data) => {
	  let messageAttributes = {
		content: data.content,
		userName: data.userName,
		user: data.userId,
	  };
	  Message.create(messageAttributes)
		.then(() => {
		  io.emit("message", messageAttributes);	// Sending to client
		})
		.catch((error) => {
		  console.log(`error: ${error.message}`);
		});
	});
	Message.find({})
	  .sort({ createdAt: -1 })
	  .limit(20)
	  .then((messages) => {
		client.emit("load all messages", messages.reverse());	// Display 20 most recent messages
	  });
  });
};
