import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Chat backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});