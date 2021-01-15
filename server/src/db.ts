import { resolve } from "path";

// load server enviroment variables
require('dotenv').config({ path: resolve(process.cwd(), "server", ".env") });