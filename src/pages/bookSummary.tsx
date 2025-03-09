export default function BookSummaryPage({
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
			<a href={`/books/${bookId}`} class="a-reset">
				<h1>Summary of: {bookTitle}</h1>
			</a>
			<div className="card mb-2">
				<p>{summary}</p>
			</div>
			<div className="flex gap-2">
				<a href={`/books/${bookId}`} className="btn btn-primary">
					See Book details
				</a>
				<a href={`/books/${bookId}/read`} className="btn">
					Read Full Book
				</a>
			</div>
		</div>
	);
}
