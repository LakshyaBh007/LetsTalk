const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("./models/user");
const Message = require("./models/message");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 8000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Database connection
mongoose
  .connect("mongodb+srv://lakshyabhatia49:lakshya@cluster0.twzzp.mongodb.net/")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

// In-memory map for user socket connections
let users = {};

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User registered with ID: ${userId}`);
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, recipientId, messageType, messageText } = data;

    const newMessage = new Message({
      senderId,
      recipientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
    });

    await newMessage.save();

    // Emit message to recipient if connected
    if (users[recipientId]) {
      io.to(users[recipientId]).emit("newMessage", data);
    }

    // Optionally emit to the sender
    io.to(users[senderId]).emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

// JWT token generation
const createToken = (userId) => {
  const payload = { userId };
  return jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "files/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Define your REST API endpoints
app.post("/register", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering the user!" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get users excluding the current user
app.get("/users/:userId", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.userId } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// Fetch chat messages between two users
app.get("/messages/:senderId/:recipientId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.params.senderId, recipientId: req.params.recipientId },
        { senderId: req.params.recipientId, recipientId: req.params.senderId },
      ],
    }).sort("timestamp");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving messages" });
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
