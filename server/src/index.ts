import express = require("express");
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import jwt = require("jsonwebtoken");
import bcrypt = require("bcryptjs");

// connect to mongodb and import all collection for use in querys
import { users } from "./db";

const app = express();
const PORT = 3000;

// load plugins
app.use(bodyParser.json());
app.use(cors());

// specific settings for prod and dev enviroment
if (process.env.NODE_ENV != "production") {
  app.use(morgan("dev"));
}

// generate access token from given data and secret
function generateAccessToken(dataToBeSaved: {}, secret: string) {
  return jwt.sign(dataToBeSaved, secret, { expiresIn: "30d" });
}


/**
 * MIDDLEWARES
 */

// authenticate the jwt token (middleware)
function authJWT(req: any, res: any, next: any) {
  // get header from request
  const header = req.headers.authorization;

  // if header specified
  if (header) {

    // get access token from header
    // header structure == Authorization: Bearer <access token>
    const token = header.split(" ")[1];

    // verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err: any, user: any) => {

      // if token could not be verified
      if (err) {
        res.json({
          status: "error",
          msg: "Forbidden",
          err: "403"
        });
      }

      // save user in req for further API calls
      req.user = user;
      next();
    });

    // if header not specified
  } else {
    res.json({
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

  // search in users collection if user with same email exists
  if (await users.exists({
    email: req.body.email.toString()
  })) {

    res.json({
      status: "error",
      msg: "User with same nickname or email already exists"
    });

  } else {

    // create new user from request data
    let user = new users({
      email: req.body.email.toString(),
      password: bcrypt.hashSync(req.body.password.toString(), 10),
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
        // sign token after sign up
        const accessToken = generateAccessToken({ email: doc.email }, process.env.JWT_SECRET);

        res.json({
          user: doc,
          accessToken: accessToken,
          msg: "Signed up user"
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
        msg: "Error when checking user",
        err: err
      });
    } else {
      // if no user with given email has been found in db
      if (doc == null) {
        res.json({
          status: "error",
          msg: "Email/Password combination wrong"
        });
      } else {
        // compare passwords
        bcrypt.compare(req.body.password.toString(), doc.password, (err: Error, result: Boolean) => {
          if (err) {
            res.json({
              status: "error",
              msg: "Error on password comparison",
              error: err
            });
          } else {
            if (!result) {
              res.json({
                status: "error",
                msg: "Email/Password combination wrong"
              });
            } else {
              const accessToken = generateAccessToken({ email: doc.email }, process.env.JWT_SECRET);

              res.json({
                user: doc,
                accessToken: accessToken,
                msg: "Signed in user"
              });
            }
          }
        });
      }
    }
  });
});

app.listen(PORT, () => console.log(`server listening on port ${PORT}.`));