const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const PORT = 8080 || process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.use(express.static(path.join(__dirname, "public")));

const BOT_NAME = "Chatty Bot";


io.on("connection", (socket) => {
  

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    
    socket.emit(
      "botMessage",
      formatMessage(BOT_NAME, `Welcome to #${room.toLowerCase()}`)
    );

   
    socket.broadcast
      .to(user.room)
      .emit(
        "botMessage",
        formatMessage(BOT_NAME, `${user.username} has joined the room`)
      );

    
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

 
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "botMessage",
        formatMessage(BOT_NAME, `${user.username} has left the room`)
      );

      
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`App is listening on port: ${PORT}`));
