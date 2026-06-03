export enum Status {
  Read = "Read",
  Reread = "Re-read",
  DNF = "DNF",
  CurrentlyReading = "Currently reading",
  ReturnedUnread = "Returned Unread",
  WantToRead = "Want to read",
}

export enum Format {
  Print = "Print",
  PDF = "PDF",
  Ebook = "Ebook",
  AudioBook = "AudioBook",
}

// La classe Book
export class Book {
  title: string;
  author: string;
  pages: number;
  status: Status;
  price: number;
  pagesRead: number;
  format: Format;
  suggestedBy: string;
  finished: boolean;

  constructor(
    title: string,
    author: string,
    pages: number,
    status: Status,
    price: number,
    pagesRead: number,
    format: Format,
    suggestedBy: string
  ) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.status = status;
    this.price = price;
    this.pagesRead = pagesRead;
    this.format = format;
    this.suggestedBy = suggestedBy;
    // finished est false par défaut, true si pagesRead == pages
    this.finished = pagesRead >= pages;
  }

  // Retourne le pourcentage de lecture
  currentlyAt(): number {
    if (this.pages === 0) return 0;
    return Math.round((this.pagesRead / this.pages) * 100);
  }

  // Supprime le livre de la DB (on passe le modèle Mongoose)
  async deleteBook(BookModel: any): Promise<void> {
    await BookModel.deleteOne({ title: this.title });
  }
}