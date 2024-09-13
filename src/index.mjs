import express from "express";
import http from "http";
import { Server } from "socket.io";
import fileUpload from "express-fileupload";

import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";

import passport from "passport";

import "./strategies/local-strategy.mjs";
import "./strategies/discord-strategy.mjs";
import "./strategies/github-strategy.mjs";
import "./strategies/google-strategy.mjs";
import errorHandler from "./middleware/errorMiddleware.mjs";
import { Notification } from "./mongoose/schemas/notifications.mjs";
import { messageNotification } from "./mongoose/schemas/messageNotification.mjs";

//import passport from "./utils/passport-setup.mjs";

dotenv.config();

const app = express();

// mongodb://localhost/express-tutorial

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(fileUpload());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // make it not guessable
    saveUninitialized: false, // not saving unmodified sessions data to the store
    resave: false, // resaves the session in session store per request
    cookie: {
      maxAge: 60000 * 60 * 24,
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  })
);

app.use(passport.initialize()); // Initialize passport after session
app.use(passport.session()); // Since we are using session, we need to use passport.session() to keep track of the user's session

app.use(routes);

// The request handler function is called by serializeUser
app.post("/api/auth", passport.authenticate("local"), (request, response) => {
  try {
    request.session.cookie.sameSite = "none";
    request.session.cookie.secure = true;
    return response.status(200).json(request.user);
    //response.redirect(`${process.env.CLIENT_URL}/feed`);
  } catch (error) {
    return response.status(400).json(error); // not reachable
  }
});

// modify this endpoint, it sends back the password
app.get("/api/auth/status", (request, response) => {
  return request.user ? response.json(request.user) : response.sendStatus(401);
});

// logout modified
app.post("/api/auth/logout", (request, response) => {
  if (!request.user) {
    return response.sendStatus(401); // Send a 401 if the user is not authenticated
  }

  request.logout((err) => {
    if (err) {
      if (!response.headersSent) {
        return response.sendStatus(400); // Error during logout, send a 400 if headers aren't already sent
      }
    }

    if (!response.headersSent) {
      return response.sendStatus(200); // Successful logout, send 200 if headers aren't already sent
    }
  });
});

app.get("/api/auth/discord", passport.authenticate("discord"));
app.get(
  "/api/auth/discord/redirect",
  passport.authenticate("discord"),
  (request, response) => {
    response.redirect(`${process.env.CLIENT_URL}/feed`);
  }
);

app.get("/api/auth/github", passport.authenticate("github"));
app.get(
  "/api/auth/github/redirect",
  passport.authenticate("github"),
  (request, response) => {
    response.redirect(`${process.env.CLIENT_URL}/feed`);
  }
);

app.get("/api/auth/google", passport.authenticate("google"));
app.get(
  "/api/auth/google/redirect",
  passport.authenticate("google"),
  (request, response) => {
    response.redirect(`${process.env.CLIENT_URL}/feed`);
  }
);

// Socket event completes first before mongodb change-streams,
// this is why we need to store the notification in a variable
// In the  frontend we will wait some seconds before emitting the notification event
let myNotification;

await Notification.watch().on("change", async (data) => {
  if (data.operationType === "insert") {
    const notificationId = data.documentKey._id;

    try {
      // Fetch the full post document with the author populated
      const notification = await Notification.findById(notificationId)
        .populate("userId", "-password")
        .populate("commentId")
        .populate("followerId")
        .populate("likerId")
        .populate("commenterId")
        .populate("replierId")
        .populate({
          path: "replyId",
          populate: [
            {
              path: "commentId",
            },
          ],
        });

      myNotification = notification;
    } catch (error) {
      console.error("Error fetching or populating post:", error);
    }
  }
});

await messageNotification.watch().on("change", async (data) => {
  if (data.operationType === "insert") {
    const notificationId = data.documentKey._id;

    try {
      // Fetch the full post document with the author populated
      const notification = await messageNotification
        .findById(notificationId)
        .populate("messageId")
        .populate("senderId", "-password");

      myNotification = notification;
    } catch (error) {
      console.error("Error fetching or populating post:", error);
    }
  }
});

app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_notifications", (userId) => {
    socket.join(userId);
  });

  socket.on("new_notification", () => {
    if (myNotification) {
      socket
        .to(myNotification.userId.toString())
        .emit("notification", myNotification);
    }
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (message) => {
    socket.to(message.chatId).emit("receive_message", message);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
