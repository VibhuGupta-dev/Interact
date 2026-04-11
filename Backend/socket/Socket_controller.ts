const roomUsers: Record<
  string,
  { name: string; role: string; userId: string }[]
> = {};
import { Room } from "../modules/Room_modules/Room_model.js";

export function socketcontroller(io: any) {
  console.log("socket setup");

  io.on("connection", (socket: any) => {
    console.log("USER CONNECTED:", socket.id);

    socket.on("owner-join", (data: any) => {
      socket.join(`Owner-${data.roomcode}`);
      socket.join(data.roomcode);
      socket.name = data.name;
      socket.roomcode = data.roomcode;
      socket.role = data.role;

      if (!roomUsers[data.roomcode]) {
        roomUsers[data.roomcode] = [];
      }

      const alreadyExists = roomUsers[data.roomcode].find(
        (u) => u.userId === socket.id,
      );
      if (!alreadyExists) {
        roomUsers[data.roomcode].push({
          name: data.name,
          role: data.role,
          userId: socket.id,
        });
      }

      io.to(data.roomcode).emit("users-update", roomUsers[data.roomcode]);
      console.log("Owner joined:", socket.id, roomUsers[data.roomcode]);
    });

    socket.on("user-join-request", (data: any) => {
      socket.roomcode = data.roomcode;
      socket.name = data.name;
      socket.role = data.role;

      io.to(`Owner-${data.roomcode}`).emit("newjoinreq", {
        name: data.name,
        userId: socket.id,
        role: data.role,
        message: `${data.name} wants to join`,
      });
    });

    socket.on("acceptJoinRequest", (data: any) => {
      const targetSocket = io.sockets.sockets.get(data.userId);

      if (targetSocket) {
        targetSocket.join(data.roomcode);

        if (!roomUsers[data.roomcode]) roomUsers[data.roomcode] = [];

        const alreadyExists = roomUsers[data.roomcode].find(
          (u) => u.userId === data.userId,
        );
        if (!alreadyExists) {
          roomUsers[data.roomcode].push({
            name: data.name,
            role: data.role,
            userId: data.userId,
          });
        }

        io.to(data.userId).emit("requestAccepted");

        io.to(data.roomcode).emit("users-update", roomUsers[data.roomcode]);

        console.log("User accepted:", data.name, roomUsers[data.roomcode]);
      } else {
        console.log("Socket not found:", data.userId);
      }
    });

    socket.on("rejectJoinRequest", (data: any) => {
      io.to(data.userId).emit("requestRejected");
    });
     
socket.on("send-message", (data: any) => {
  io.to(data.room).emit("receive-message", {
    name: data.name,
    room: data.room,
    text: data.text,
    time: data.time,
  });
});
    socket.on("disconnect", (reason: any) => {
      console.log("Disconnected:", socket.id, reason);

      if (socket.roomcode && roomUsers[socket.roomcode]) {
        roomUsers[socket.roomcode] = roomUsers[socket.roomcode].filter(
          (u) => u.userId !== socket.id,
        );

        io.to(socket.roomcode).emit("users-update", roomUsers[socket.roomcode]);
        io.to(socket.roomcode).emit("userLeft", {
          name: socket.name,
          userId: socket.id,
        });

        if (roomUsers[socket.roomcode].length === 0) {
          delete roomUsers[socket.roomcode];
        }
      }
    });
  });
}
