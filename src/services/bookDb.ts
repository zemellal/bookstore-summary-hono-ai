import type { Bindings } from "../types";

export interface BookData {
	id: string;
	title: string;
	author: string;
	description?: string;
	keywords?: string;
	classification?: string;
	summary?: string;
	r2_path?: string;
	created_at?: Date;
}

export async function getBookById(
	env: Bindings,
	bookId: string,
): Promise<BookData | null> {
	const query = "SELECT * FROM books WHERE id = ?";
	return await env.DB.prepare(query).bind(bookId).first<BookData>();
}

export async function getAllBooks(env: Bindings): Promise<BookData[]> {
	const query = "SELECT * FROM books ORDER BY created_at DESC";
	const { results } = await env.DB.prepare(query).all<BookData>();

	return results || [];
}

export async function createBook(
	env: Bindings,
	bookData: BookData,
): Promise<void> {
	const query =
		"INSERT INTO books (id, title, author, description, keywords, classification, r2_path) VALUES (?, ?, ?, ?, ?, ?, ?)";
	await env.DB.prepare(query)
		.bind(
			bookData.id,
			bookData.title,
			bookData.author,
			bookData.description || null,
			bookData.keywords || null,
			bookData.classification || null,
			bookData.r2_path || null,
		)
		.run();
}

export async function saveBookSummary(
	env: Bindings,
	bookId: string,
	summary: string,
): Promise<void> {
	const query = "UPDATE books SET summary = ? WHERE id = ?";
	await env.DB.prepare(query).bind(summary, bookId).run();
}
