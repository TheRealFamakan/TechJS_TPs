import { Router, Request, Response } from "express";
import BookModel from "../models/book.model";
import { Book } from "../Book";

const router = Router();

// GET tous les livres
router.get("/", async (req: Request, res: Response) => {
  const books = await BookModel.find();
  res.json(books);
});

// POST créer un livre
router.post("/", async (req: Request, res: Response) => {
  const { title, author, pages, status, price, pagesRead, format, suggestedBy } = req.body;

  // On utilise la classe Book pour créer l'objet
  const newBook = new Book(title, author, pages, status, price, pagesRead, format, suggestedBy);

  // On sauvegarde en DB
  const saved = await BookModel.create(newBook);
  res.status(201).json(saved);
});

// DELETE un livre
router.delete("/:id", async (req: Request, res: Response) => {
  await BookModel.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

// PATCH mettre à jour les pages et le statut d'un livre
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { pagesRead, finished, status } = req.body;
    const updatedBook = await BookModel.findByIdAndUpdate(
      req.params.id,
      { $set: { pagesRead, finished, status } },
      { new: true } // Renvoie la version mise à jour
    );
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
});

export default router;