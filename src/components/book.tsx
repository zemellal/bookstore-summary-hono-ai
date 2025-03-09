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
				<a href={`/books/${book.id}`} className="btn btn-sm">
					Details
				</a>
				<a
					href={`/books/${book.id}/summary`}
					className="btn btn-primary btn-sm"
				>
					{book.summary ? "View AI Summary" : "Generate AI Summary"}
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

/**
 * Component for rendering book details card
 */
export function BookDetails({ book }: { book: BookData }) {
	return (
		<div className="card mb-2">
			<h2 className="text-2xl mb-2">Book Details</h2>
			<p>
				<strong>Author:</strong> {book.author}
			</p>

			<div className="flex gap-4 mt-4">
				<a href={`/books/${book.id}/read`} className="btn">
					Read Full Book
				</a>
			</div>
		</div>
	);
}

/**
 * Component for rendering book summary card
 */
export function BookSummary({ book }: { book: BookData }) {
	return (
		<>
			{book.summary ? (
				<div className="card">
					<h2 className="text-2xl mb-2">Summary Preview</h2>
					<p className="italic">{book.summary.substring(0, 150)}...</p>
					<div className="mt-2">
						<a href={`/books/${book.id}/summary`} className="btn btn-primary">
							Read Full Summary
						</a>
					</div>
				</div>
			) : (
				<div className="card">
					<h2 className="text-2xl mb-2">No Summary Available</h2>
					<p>This book doesn't have an AI-generated summary yet.</p>
					<div className="mt-2">
						<a href={`/books/${book.id}/summary`} className="btn btn-primary">
							Generate Summary
						</a>
					</div>
				</div>
			)}
		</>
	);
}
