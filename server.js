import express from "express";

import booksRoutes from "./routes/books.routes.js";
import authorsRoutes from "./routes/authors.routes.js";


const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is ok");
});

app.use("/books", booksRoutes);
app.use("/authors", authorsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "endpoint not found" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`server running on  http://localhost${PORT} 🚀`);
});
