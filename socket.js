import { io } from "socket.io-client";
import { SERVER_URL } from "./api/assets";

const SOCKET_URL = `${SERVER_URL}`;

let socket

  export const connectSocket = (userID) => {
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    query: { userID },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not connected. Call connectSocket() first.");
  }
  return socket;
};