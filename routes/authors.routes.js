import express from "express";
import { nanoid } from "nanoid";

import { Author } from "../models/Author.js";

const authorKeys = ["name", "country"];

import { read, write, clearAndWrite } from "../utils/file-utils.js";
import { fixBody } from "../utils/fixBody.js";

const router = express.Router();

router.get("", async (req, res) => {
  const authors = await Author.findAll();

  res.json({ message: "successfully fetched all authors", authors });
});

router.get("/:id", async (req, res) => {
  // const [author] = await Author.findAll({ where: { id: req.params.id } });
  const author = await Author.findByPk(req.params.id);

  const books = await author.getBooks();

  if (author === null) {
    return res.status(404).json({ message: "Author not found!" });
  }

  res.json({
    message: "get author successfully",
    author: {
      ...author.toJSON(),
      books,
    },
  });
});

router.post("", async (req, res) => {
  try {
    await Author.create(req.body, {
      fields: authorKeys,
    });

    res.status(201).json({ message: "author added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error!", errMessage: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id: authorId } = req.params;

  try {
    const author = await Author.findByPk(authorId);

    if (author === null) {
      return res.status(404).json({ message: "Author not found!" });
    }

    const updatedAuthor = await author.update(req.body, {
      fields: authorKeys,
    });

    res.json({
      message: "author updated successfully",
      updatedAuthor,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error!", errMessage: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id: authorId } = req.params;

  const author = await Author.findByPk(authorId);

  if (author === null) {
    return res.status(404).json({ message: "Author not found!" });
  }

  await author.destroy();

  res.json({
    message: "author deleted successfully",
  });
});

export default router;
