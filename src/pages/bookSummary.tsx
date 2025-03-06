export function BookSummaryPage({
	bookTitle,
	summary,
	bookId,
}: {
	bookTitle: string;
	summary: string;
	bookId: string;
}) {
	return (
		<div>
			<h1>Summary of: {bookTitle}</h1>
			<div className="card mb-2">
				<p>{summary}</p>
			</div>
			<div className="flex gap-2">
				<a href={`/books/${bookId}/read`} className="btn btn-primary">
					Read Full Book
				</a>
				<a href={`/books/${bookId}`} className="btn">
					See Book details
				</a>
			</div>
		</div>
	);
}
