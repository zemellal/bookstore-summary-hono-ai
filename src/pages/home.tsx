import { BookSearchForm } from "../components/bookForm";

export default function HomePage({ name }: { name: string }) {
	return (
		<main>
			<h1>Hello! {name}</h1>
			<BookSearchForm />

			<div>
				<a href="/books" className="btn">
					View my Books Library
				</a>
			</div>
		</main>
	);
}
