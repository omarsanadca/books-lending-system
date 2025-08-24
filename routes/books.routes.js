import express from "express";

import { fixBody } from "../utils/fixBody.js";

import db from "../utils/db.js";

import { Book } from "../models/Book.js";
import { Author } from "../models/Author.js";

const booksKeys = ["title", "authorId", "year", "isBorrowed"];

const router = express.Router();

router.get("", async (req, res) => {
  try {
    const books = await Book.findAll();

    console.log(books.map((b) => b.toJSON()));

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

    const book = await Book.findByPk(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
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
    const booksData = req.body;

    const { title, authorId, year, isBorrowed } = booksData;

    if (!title || !authorId || !year || isBorrowed === undefined) {
      return res.status(400).json({ message: "invalid arguments" });
    }

    const author = await Author.findByPk(authorId);

    if (!author) {
      return res.status(404).json({ message: "Author not found!" });
    }

    // const newBook = Book.build(req.body, {
    //   fields: ["title", "year", "isBorrowed"],
    // });

    // const result = await author.addBook(newBook);

    await author.createBook(booksData, { fields: booksKeys });

    res.status(201).json({
      message: "book created successfully",
      // book: author.getBooks({where}),
    });
  } catch (err) {
    console.log("Error when POST /books/ -> ", err.message);
    res.status(500).json({
      message: "Internal Server Error, please try again later.",
      errMessage: err.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const booksData = fixBody(req.body, booksKeys);

    const book = await Book.findByPk(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    book.set(booksData);

    await book.save();

    if (booksData.authorId) {
      const author = await Author.findByPk(booksData.authorId);
      if (!author) {
        return res.status(404).json({ message: "Author not found!" });
      }
      await book.setAuthor(author);
    }

    res.json({ message: "book updated!", updatedBook: book });
  } catch (err) {
    console.log("Error when PATCH /books/:id -> ", err.message);
    res.status(500).json({
      message: "Internal Server Error, please try again later.",
      errMessage: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const book = await Book.findByPk(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    await book.destroy();

    res.json({ message: "Book deleted!" });
  } catch (err) {
    console.log("Error when DELETE /books/:id -> ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, please try again later." });
  }
});

router.delete("/", async (req, res) => {
  try {
    await Book.destroy({ where: { year: 2020 } });

    res.json({ message: "all books were deleted" });
  } catch (err) {
    console.log("Error when DELETE /books/:id -> ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error, please try again later." });
  }
});

export default router;
