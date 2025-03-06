import type { BookData } from "../services/bookDb";

export function BookDetailsPage({ book }: { book: BookData }) {
	const formattedDate = new Date(book.created_at as Date).toLocaleDateString();

	return (
		<div>
			<h1>{book.title}</h1>
			<div className="mb-2">
				<span className="badge">{book.id}</span>
				<span className="text-sm text-muted"> · Added on {formattedDate}</span>
			</div>

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

			<div className="mt-4">
				<a href="/books" className="btn">
					Return to Library
				</a>
			</div>
		</div>
	);
}
