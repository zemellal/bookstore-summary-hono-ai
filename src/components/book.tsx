import type { BookData } from "../services/bookDb";

/**
 * Component for rendering a single book item in the list
 */
export function BookItem({ book }: { book: BookData }) {
	const formattedDate = new Date(book.created_at as Date).toLocaleDateString();

	return (
		<li className="card">
			<div className="flex justify-between items-center">
				<span className="badge">{book.id}</span>
				<span className="text-sm text-muted">{formattedDate}</span>
			</div>

			<h3 className="book-title">
				<a href={`/books/${book.id}`}>{book.title}</a>
			</h3>

			<div className="text-sm">
				by <span className="italic">{book.author}</span>
			</div>

			<div className="flex gap-2 mt-4">
				<a href={`/books/${book.id}/read`} className="btn btn-primary btn-sm">
					Read Book
				</a>
				<a href={`/books/${book.id}/summary`} className="btn btn-sm">
					AI Summary
				</a>
			</div>
		</li>
	);
}

/**
 * Component for rendering a list of book items
 */
export function BookList({ books }: { books: BookData[] }) {
	const sortedBooks = [...books].sort((a, b) => Number(a.id) - Number(b.id));

	return (
		<section>
			{books && books.length > 0 ? (
				<>
					<p>Found {books.length} books in the library</p>
					<ul className="book-list">
						{sortedBooks.map((book) => (
							<BookItem key={book.id} book={book} />
						))}
					</ul>
				</>
			) : (
				<div className="card">
					<p>No books in the library yet.</p>
					<p>Add books by entering a Gutenberg Project ID on the home page.</p>
				</div>
			)}
		</section>
	);
}
