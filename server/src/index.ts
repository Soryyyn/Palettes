import express = require("express");
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import jwt = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";

// connect to mongodb and import all collection for use in querys
import { users } from "./db";

const app = express();
const PORT = 8081;

// load plugins
app.use(bodyParser.json());
app.use(cors());

// specific settings for prod and dev enviroment
if (process.env.NODE_ENV != "production") {
  app.use(morgan("dev"));
}

// authenticate the jwt token (middleware)
function authJWT(req: any, res: any, next: any) {
  const header = req.headers.authorization;

  if (header) {
    const token = header.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err: any, user: any) => {
      if (err) {
        res.sendStauts({
          status: "error",
          msg: "User not signed in",
          err: "403"
        });
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStauts({
      status: "error",
      msg: "User doesn't have needed rights",
      err: "401"
    });
  }
}

/**
 * POST REQUESTS
 */
app.post("/signup", rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 minute window
  max: 5, // start blocking after
  message: "Limit reached from this IP, please try again in a few minutes"
}), async (req: any, res: any) => {
  // search in users collection if user with same email
  // already
  if (await users.exists({
    email: req.body.email.toString()
  })) {

    res.json({
      status: "error",
      msg: "User with same nickname or email already exists"
    });

  } else {

    // create new user
    let user = new users({
      email: req.body.email.toString(),
      password: req.body.password.toString(),
      role: req.body.role.toString()
    });

    // save new user in collection
    users.create(user, (err: any, doc: any) => {
      if (err) {
        res.json({
          status: "error",
          msg: "Couldn't create new user",
          error: err
        });
      } else {
        // also signin user after signup
        const accessToken = jwt.sign({ email: doc.email, role: doc.role }, process.env.JWT_SECRET);
        res.json({
          accessToken
        });
      }
    });

  }
});

app.post("/signin", rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 minute window
  max: 5, // start blocking after
  message: "Limit reached from this IP, please try again in a few minutes"
}), async (req: any, res: any) => {

  // search for user with same email
  users.findOne({ email: req.body.email.toString() }, (err: any, doc: any) => {

    // error on search
    if (err) {
      res.json({
        status: "error",
        msg: "error when checking user",
        err: err
      });
    } else {
      if (doc == null) {
        res.json({
          status: "error",
          msg: "No user with this email or password"
        });
      } else {
        // TODO: compare passwords with bcrypt here
        const accessToken = jwt.sign({ email: doc.email, role: doc.role }, process.env.JWT_SECRET);
        res.json({
          accessToken
        });
      }
    }

  });

});

app.listen(PORT, () => console.log(`server listening on port ${PORT}.`));