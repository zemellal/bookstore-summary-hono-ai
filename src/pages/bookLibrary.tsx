import { BookList } from "../components/book";
import type { BookData } from "../services/bookDb";

export default function BookLibraryPage({ books }: { books: BookData[] }) {
	return (
		<div>
			<h1>
				<a href="/" class="a-reset">
					Book Library
				</a>
			</h1>

			<BookList books={books} />

			<div className="mt-4">
				<a href="/" className="btn">
					Home
				</a>
			</div>
		</div>
	);
}
