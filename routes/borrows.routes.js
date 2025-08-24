import express from "express";
import { nanoid } from "nanoid";

import { clearAndWrite, read, write } from "../utils/file-utils.js";
import { fixBody } from "../utils/fixBody.js";
import { Borrow } from "../models/Borrow.js";
import { Book } from "../models/Book.js";

const borrowsKeys = ["bookId", "userName"];

const router = express.Router();

// ?late=true
router.get("/", async (req, res) => {
  const { late } = req.query;

  // if (late) {
  //   const lateBorrows = borrows.filter((b) => b.durationInDays > 7);
  //   return res.json({ message: "Fetched late borrows", lateBorrows });
  // }

  const borrows = await Borrow.findAll();

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

  try {
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    if (book.isBorrowed) {
      return res.status(400).json({
        message:
          "Cannot borrow this book at this moment, as it is already borrowed",
      });
    }

    await book.createBorrow({ useName: userName });

    book.isBorrowed = true;
    await book.save();

    res.json({ message: "Book borrowed!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error!", errMessage: err.message });
  }
});

router.patch("/:id/return", async (req, res) => {
  const { id: borrowId } = req.params;

  const borrow = await Borrow.findByPk(borrowId);

  if (!borrow) {
    return res.status(404).json({ message: "Borrow not found!" });
  }

  const book = await borrow.getBook();

  if (!book.isBorrowed) {
    return res.status(400).json({ message: "This book was already returned" });
  }

  book.isBorrowed = false;
  await book.save();

  res.json({ message: "Book returned successfully" });
});

export default router;
