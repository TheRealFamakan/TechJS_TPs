import express from "express";
import mongoose from "mongoose";
import path from "path";
import booksRouter from "./routes/books";

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // sert les HTML

// Connexion MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/booktracker")
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.log(err));

// Routes
app.use("/books", booksRouter);

app.listen(PORT, () => {
  console.log(`Serveur sur http://localhost:${PORT}`);
});