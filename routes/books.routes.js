import { nanoid } from "nanoid";
import express from "express";

import { clearAndWrite, read, write } from "../utils/file-utils.js";
import { fixBody } from "../utils/fixBody.js";

const booksKeys = ["title", "authorId", "year", "isBorrowed"];

const router = express.Router();

router.get("", async (req, res) => {
  try {
    let books = await read("books");

    const authors = await read("authors");

    books = books.map((b) => {
      const newBook = { ...b };
      const authorId = newBook.authorId;
      delete newBook.authorId;

      const authorData = authors.find((a) => a.id === authorId);

      newBook.author = authorData;

      return newBook;
    });

    const { sort, borrowed } = req.query;

    if (sort) {
      if (sort === "asc") {
        books.sort((a, b) => {
          if (a.title < b.title) return -1;
          return 1;
        });
      } else {
        books.sort((a, b) => {
          if (a.title > b.title) return -1;
          return 1;
        });
      }
    }

    if (borrowed !== undefined) {
      if (borrowed === "true") {
        books = books.filter((b) => b.isBorrowed);
      } else {
        books = books.filter((b) => !b.isBorrowed);
      }
    }

    res.json({ message: "books fetched successfully", books });
  } catch (err) {
    console.log("Error when GET /books/ -> ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, please try again later." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const books = await read("books");

    const book = books.find((b) => b.id === bookId);

    if (!book) {
      return res.status(404).json({ message: "Book Not Found" });
    }

    res.json({ message: "Fetched book", book });
  } catch (err) {
    console.log("Error when GET /books/:id -> ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, please try again later." });
  }
});

router.post("", async (req, res) => {
  try {
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

    res
      .status(201)
      .json({ message: "book created successfully", book: newBook });
  } catch (err) {
    console.log("Error when POST /books/ -> ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, please try again later." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
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
  } catch (err) {
    console.log("Error when PATCH /books/:id -> ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, please try again later." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const books = await read("books");

    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({ message: "Book Not Found" });
    }

    books.splice(bookIndex, 1);

    clearAndWrite("books", books);

    res.json({ message: "book deleted successfully" });
  } catch (err) {
    console.log("Error when DELETE /books/:id -> ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, please try again later." });
  }
});

export default router;
