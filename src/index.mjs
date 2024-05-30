import express, { request, response } from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// import "./strategies/local-strategy.mjs";
// import "./strategies/discord-strategy.mjs";
// import "./strategies/github-strategy.mjs";
import "./strategies/google-strategy.mjs";

const app = express();

mongoose
  .connect("mongodb://localhost/express-tutorial")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser("helloworld"));
app.use(
  session({
    secret: "avitus the dev", // make it not guessable
    saveUninitialized: false, // not saving unmodified sessions data to the store
    resave: false, // resaves the session in session store per request
    cookie: {
      maxAge: 60000 * 60,
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
  response.sendStatus(200);
  console.log(`Inside /auth endpoint`);
  console.log(request.user);
});

app.get("/api/auth/status", (request, response) => {
  console.log(`Inside /auth/status endpoint`);
  return request.user ? response.json(request.user) : response.sendStatus(401);
});

app.post("/api/auth/logout", (request, response) => {
  if (!request.user) return response.sendStatus(401);
  request.logout((err) => {
    if (err) return response.sendStatus(400);
    response.sendStatus(200);
  });
});

/*

app.get("/api/auth/discord", passport.authenticate("discord"));
app.get(
  "/api/auth/discord/redirect",
  passport.authenticate("discord"),
  (request, response) => {
    console.log(request.session);
    console.log(request.user);
    response.sendStatus(200);
  }
);

*/

app.get("/api/auth/github", passport.authenticate("github"));
app.get(
  "/api/auth/github/redirect",
  passport.authenticate("github"),
  (request, response) => {
    console.log("inside auth");
    response.status(200).json(request.user);
  }
);

app.get("/api/auth/google", passport.authenticate("google"));
app.get(
  "/api/auth/google/redirect",
  passport.authenticate("google"),
  (request, response) => {
    console.log("inside auth google");
    response.redirect(`${process.env.CLIENT_URL}/home`);
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
