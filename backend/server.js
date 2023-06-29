// core modules
const path = require("path");
const http = require("http");

// express initializaion
const express = require("express");
const app = express();

// import and initialize socket
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// global constants
const PORT = process.env.PORT || 3000;
const botName = "JustTalk bot";

// utility functions
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeaves,
  getRoomUsers,
} = require("./utils/users");

// serve static assets
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("Join Room", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit(
      "message",
      formatMessage(
        botName,
        "Welcome to JustTalk! This is a chatting platform developed by Nikhil Sourav!"
      )
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    socket.on("disconnect", () => {
      // delete user from temporary db
      const user = userLeaves(socket.id);

      // Send message that user left
      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`)
        );

        // Send users and room info to update
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
});

// fire up server
server.listen(PORT, () => console.log(`server up on port ${PORT}`));
