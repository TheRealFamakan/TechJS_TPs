import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  author:      { type: String, required: true },
  pages:       { type: Number, required: true },
  status:      { type: String, required: true },
  price:       { type: Number, required: true },
  pagesRead:   { type: Number, required: true, default: 0 },
  format:      { type: String, required: true },
  suggestedBy: { type: String, required: true },
  finished:    { type: Boolean, default: false },
});

export default mongoose.model("Book", bookSchema);