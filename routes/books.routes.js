import { nanoid } from "nanoid";
import express from "express";

import { clearAndWrite, read, write } from "../utils/file-utils.js";
import { fixBody } from "../utils/fixBody.js";

const booksKeys = ["title", "authorId", "year", "isBorrowed"];

const router = express.Router();

router.get("", async (req, res) => {
  const books = await read("books");
  res.json({ message: "books fetched successfully", books });
});

router.get("/:id", async (req, res) => {
  const { id: bookId } = req.params;

  const books = await read("books");

  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return res.status(404).json({ message: "Book Not Found" });
  }

  res.json({ message: "Fetched book", book });
});

router.post("", async (req, res) => {
  const booksData = fixBody(req.body, booksKeys);

  const { title, authorId, year, isBorrowed } = booksData;

  if (!title || !authorId || !year || isBorrowed === undefined) {
    return res.status(400).json({ message: "invalid arguments" });
  }

  const authors = await read("authors");

  const authorIndex = authors.findIndex((a) => a.id === authorId);

  if (authorIndex === -1) {
    return res.status(404).json({ message: "author not found" });
  }

  const newBook = { id: nanoid(), ...booksData };

  await write("books", newBook);

  res.status(201).json({ message: "book created successfully", book: newBook });
});

router.patch("/:id", async (req, res) => {
  const { id: bookId } = req.params;
  const booksData = fixBody(req.body, booksKeys);

  const books = await read("books");

  const bookIndex = books.findIndex((b) => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book Not Found" });
  }

  books[bookIndex] = { ...books[bookIndex], ...booksData };

  await clearAndWrite("books", books);

  res.json({ message: "book updated!", updatedBook: books[bookIndex] });
});

router.delete("/:id", async (req, res) => {
  const { id: bookId } = req.params;

  const books = await read("books");

  const bookIndex = books.findIndex((b) => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book Not Found" });
  }

  books.splice(bookIndex, 1);

  clearAndWrite("books", books);

  res.json({ message: "book deleted successfully" });
});

export default router;
