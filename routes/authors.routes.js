import express from "express";
import { nanoid } from "nanoid";

const authorKeys = ["name", "country"];

import { read, write, clearAndWrite } from "../utils/file-utils.js";
import { fixBody } from "../utils/fixBody.js";

const router = express.Router();

router.get("", async (req, res) => {
  const authors = await read("authors");

  res.json({ message: "successfully fetched all authors", authors });
});

router.get("/:id", async (req, res) => {
  const { id: authorId } = req.params;
  const authors = await read("authors");

  const author = authors.find((aut) => aut.id === authorId);

  if (!author) {
    return res.status(404).json({ message: "author not found" });
  }

  res.json({ message: "get author successfully", author });
});

router.post("", async (req, res) => {
  const { name, country } = fixBody(req.body, authorKeys);

  // validate if there are name and country
  if (!name || !country) {
    return res.status(400).json({ message: "name and country are required" });
  }

  const newAuthor = { id: nanoid(), name, country };

  await write("authors", newAuthor);

  res.status(201).json({ message: "author added successfully" });
});

router.patch("/:id", async (req, res) => {
  const { id: authorId } = req.params;
  const authorData = fixBody(req.body, authorKeys);

  const authors = await read("authors");

  const authorIdx = authors.findIndex((a) => a.id === authorId);

  if (authorIdx === -1) {
    return res.status(404).json({ message: "author not found" });
  }

  authors[authorIdx] = { ...authors[authorIdx], ...authorData };

  await clearAndWrite("authors", authors);

  res.json({
    message: "author updated successfully",
    updateAuthor: authors[authorIdx],
  });
});

router.delete("/:id", async (req, res) => {
  const { id: authorId } = req.params;

  const authors = await read("authors");

  const authorIdx = authors.findIndex((a) => a.id === authorId);

  if (authorIdx === -1) {
    return res.status(404).json({ message: "author not found" });
  }

  authors.splice(authorIdx, 1);

  await clearAndWrite("authors", authors);

  res.json({
    message: "author deleted successfully",
  });
});

export default router;
