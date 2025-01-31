const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("./models/user");
const Message = require("./models/message");

const app = express();
const server = http.Server(app);
const io = socketIo(server, {
  cors: {
    origin: "exp://192.1.160.55:8081",
    credentials: true,
  },
});

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
  //console.log("A user connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User registered with ID: ${userId}`);
  });

  socket.on("sendMessage", async (data) => {
    console.log(data);
    const { senderId, recepientId, messageType, messageText } = data;

    console.log(recepientId);

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
    });

    await newMessage.save();

    // Emit message to recipient if connected
    if (users[recepientId]) {
      console.log("hi");
      io.to(users[recepientId]).emit("newMessage", data);
    }

    // Optionally emit to the sender
    //io.to(users[senderId]).emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    //console.log("A user disconnected:", socket.id);
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

const UPLOADS_FOLDER = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,UPLOADS_FOLDER); // Store images in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Serve images statically so they can be accessed by frontend
app.use("/api/uploads", express.static(UPLOADS_FOLDER));

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = `http://10.0.2.2:8000/api/uploads/${req.file.filename}`; // Corrected path
  res.status(200).json({ imageUrl });
});


app.post("/register", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newUser = new User({ name, email, password, image });
    const savedUser = await newUser.save();

    res.status(200).json({
      _id: savedUser._id,
      message: "User registered successfully",
      image: savedUser.image,
    });
  } catch (err) {
    console.error("Error registering user", err);
    res.status(500).json({ message: "Error registering the user!" });
  }
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //check if the email and password are provided
  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and the password are required" });
  }

  //check for that user in the database
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        //user not found
        return res.status(404).json({ message: "User not found" });
      }

      //compare the provided passwords with the password in the database
      if (user.password !== password) {
        return res.status(404).json({ message: "Invalid Password!" });
      }

      const token = createToken(user._id);
      res.status(200).json({ token });
    })
    .catch((error) => {
      console.log("error in finding the user", error);
      res.status(500).json({ message: "Internal server Error!" });
    });
});

app.get("/users/:userId", (req, res) => {
  console.log("hkighnig");
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      console.log(users, "users");
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoint to send a request to a user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { freindRequests: currentUserId },
    });

    //update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

//endpoint to show all the friend-requests of a particular user
app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user document based on the User id
    const user = await User.findById(userId)
      .populate("freindRequests", "name email image")
      .lean();

    const freindRequests = user.freindRequests;

    res.json(freindRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to accept a friend-request of a particular person
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    //retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.freindRequests = recepient.freindRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to access all the friends of the logged in user!
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//endpoint to post Messages and store it in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;
    
    //console.log(req.body,"checkkkk")
    // if (!req.file) {
    //   return res.status(400).json({ message: "No file uploaded" });
    // }

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? `http://10.0.2.2:8000/api/uploads/${req.file.filename}` : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

///endpoint to get the userDetails to design the chat Room header
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to fetch the messages between two users in the chatRoom
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to delete the messages!
app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server" });
  }
});

app.get("/friend-requests/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("sentFriendRequests", "name email image")
      .lean();

    const sentFriendRequests = user.sentFriendRequests;

    res.json(sentFriendRequests);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server" });
  }
});

app.get("/friends/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    User.findById(userId)
      .populate("friends")
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const friendIds = user.friends.map((friend) => friend._id);

        res.status(200).json(friendIds);
      });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
