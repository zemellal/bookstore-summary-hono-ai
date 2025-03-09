import { BookDetails, BookSummary } from "../components/book";
import type { BookData } from "../services/bookDb";

export default function BookDetailsPage({ book }: { book: BookData }) {
	const formattedDate = new Date(book.created_at as Date).toLocaleDateString();

	return (
		<div>
			<a href="/books" class="a-reset">
				<h1>{book.title}</h1>
			</a>
			<div className="mb-2">
				<span className="badge">{book.id}</span>
				<span className="text-sm text-muted"> · Added on {formattedDate}</span>
			</div>

			<BookDetails book={book} />

			<BookSummary book={book} />

			<div className="mt-4 flex gap-2">
				<a href="/books" className="btn">
					Library
				</a>
				<a href="/" className="btn">
					Home
				</a>
			</div>
		</div>
	);
}
