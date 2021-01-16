import mongoose from "mongoose";

const CONNECTION_URI = "mongodb://localhost:27017/Palettes";

// connection to db
mongoose.connect(CONNECTION_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}, (err: any) => {
  if (!err) {
    console.log(`connected to mongodb on ${CONNECTION_URI}`);
  } else {
    console.log(`error when connecting to mongodb: ${err}`);
  }
});

// schemas
// TODO: add email verification
// roles can be: "admin", "vip" & "member"
const user = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: "member"
  }
});

// collections
export const users = mongoose.model("users", user);
export const refreshTokens = mongoose.model("refreshTokens", new mongoose.Schema({
  token: {
    type: String,
    required: true
  }
}));