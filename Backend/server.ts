import dotenv from "dotenv";
dotenv.config();

import { server } from "./app.js"; // Import the http.Server, not app

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});