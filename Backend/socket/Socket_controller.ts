export function socketcontroller(io: any) {
  console.log("socket setup");

  io.on("connection", (socket: any) => {
    console.log("USER CONNECTED:", socket.id);

    socket.on("user-join-request", (data: any) => {
      console.log("Join request from:", data);
      socket.roomcode = data.roomcode;
      socket.name = data.name;
      socket.role = data.role;
      socket.userId = socket.id;

      // ✅ Owner ko notification bhejo
      io.to(`Owner-${socket.roomcode}`).emit("newjoinreq", {
        name: socket.name,
        message: `${socket.name} wants to join the room`,
        userId: socket.id,
      });
    });

    socket.on("owner-join", (data: any) => {
      socket.join(`Owner-${data.roomcode}`);
      socket.name = data.name;
      socket.ownerid = data.ownerid;
      socket.roomcode = data.roomcode;
      socket.role = data.role;
      console.log("Owner joined:", socket.id);
    });

    socket.on("acceptJoinRequest", (data: any) => {
      console.log("Accept join:", data);
      
      // ✅ Accept emit karo specific user ko
      io.to(data.userId).emit("requestAccepted", {
        name: data.name,
        roomcode: data.roomcode,
        role: data.role,
        message: `Your join request approved!`,
        userId: data.userId,
      });

      // ✅ User ko room mein add karo
      const targetSocket = io.sockets.sockets.get(data.userId);
      if (targetSocket) {
        targetSocket.join(data.roomcode);
        console.log("User joined room:", data.userId, "Room:", data.roomcode);
        
        // ✅ Sabko room mein notify karo
        io.to(data.roomcode).emit("userJoined", {
          name: data.name,
          userId: data.userId,
        });
      } else {
        console.log("Target socket not found for userId:", data.userId);
      }
    });

    socket.on("rejectJoinRequest", (data: any) => {
      console.log("Reject join:", data);
      io.to(data.userId).emit("requestRejected", {
        roomcode: data.roomcode,
        userId: data.userId,
        message: `Your join request was rejected`,
      });
    });

    socket.on("disconnect", (reason: any) => {
      console.log("User disconnected:", socket.id, reason);

      if (socket.roomcode) {
      
        io.to(socket.roomcode).emit("userLeft", {
          userId: socket.id,
          name: socket.name,
          message: `${socket.name} left the room`,
        });
      }
    });
  });
}