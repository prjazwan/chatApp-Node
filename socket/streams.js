module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("refresh", (data) => {
      io.emit("refreshPage", {});
    });
  });
};
