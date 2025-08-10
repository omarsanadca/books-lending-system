import express from "express";
import { nanoid } from "nanoid";

import { clearAndWrite, read, write } from "../utils/file-utils.js";
import { fixBody } from "../utils/fixBody.js";

const borrowsKeys = ["bookId", "userName"];

const router = express.Router();

// ?late=true
router.get("/", async (req, res) => {
  const { late } = req.query;
  const borrows = await read("borrows");

  if (late) {
    const lateBorrows = borrows.filter((b) => b.durationInDays > 7);
    return res.json({ message: "Fetched late borrows", lateBorrows });
  }

  res.json({ message: "Fetched all borrows", borrows });
});

router.get("/:id", async (req, res) => {
  const { id: borrowId } = req.params;

  const borrows = await read("borrows");
  const borrow = borrows.find((b) => b.id === borrowId);

  if (!borrow) {
    return res.status(404).json({ message: "Borrow not found!" });
  }

  res.json({ message: "Fetched borrow", borrow });
});

router.post("/", async (req, res) => {
  const borrowData = fixBody(req.body, borrowsKeys);

  const { bookId, userName } = borrowData;

  if (!bookId || !userName) {
    return res.status(400).json({ message: "bookId & userName are required" });
  }

  const books = await read("books");
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return res.status(404).json({ message: "Book not found!" });
  }

  if (book.isBorrowed) {
    return res.status(400).json({
      message:
        "Cannot borrow this book at this moment, as it is already borrowed",
    });
  }

  book.isBorrowed = true;
  clearAndWrite("books", books);

  const newBorrow = {
    id: nanoid(),
    ...borrowData,
    borrowedAt: new Date().toISOString(),
  };

  await write("borrows", newBorrow);

  res.json({ message: "Book borrowed!" });
});

router.patch("/:id/return", async (req, res) => {
  const { id: borrowId } = req.params;

  const borrows = await read("borrows");
  const borrow = borrows.find((b) => b.id === borrowId);

  if (!borrow) {
    return res.status(404).json({ message: "Borrow not found!" });
  }

  const books = await read("books");
  const book = books.find((b) => b.id === borrow.bookId);

  if (!book.isBorrowed) {
    return res.status(400).json({ message: "This book was already returned" });
  }

  book.isBorrowed = false;
  console.log("check BOOK-> ", book);

  await clearAndWrite("books", books);

  borrow.returnedAt = new Date().toISOString();
  borrow.durationInDays =
    (new Date(borrow.returnedAt) - new Date(borrow.borrowedAt)) /
    1000 /
    60 /
    60 /
    24;
  await clearAndWrite("borrows", borrows);

  res.json({ message: "Book returned successfully" });
});

export default router;
