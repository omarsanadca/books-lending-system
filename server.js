import express from "express";

import booksRoutes from "./routes/books.routes.js";
import authorsRoutes from "./routes/authors.routes.js";
import borrowsRoutes from "./routes/borrows.routes.js";

import sequelize from "./utils/db.js";

import { Book } from "./models/Book.js";
import { Author } from "./models/Author.js";
import { Borrow } from "./models/Borrow.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is ok");
});

app.use("/books", booksRoutes);
app.use("/authors", authorsRoutes);
app.use("/borrows", borrowsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "endpoint not found" });
});

const PORT = 4000;

/* relationships */
Author.hasMany(Book);
Book.belongsTo(Author);

Book.hasMany(Borrow);
Borrow.belongsTo(Book);

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on  http://localhost${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting to db ❌ : ${err.message}`);
  });
