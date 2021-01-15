import express = require("express");
import cors from "cors";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.listen(PORT, () => console.log(`server listening on port ${PORT}.`));