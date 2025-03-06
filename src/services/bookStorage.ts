import type { Bindings } from "../types";

export async function getBookContent(
	env: Bindings,
	bookId: string,
): Promise<string | null> {
	const storedBook = await env.books_g_ai.get(`book-${bookId}.txt`);

	if (storedBook) {
		return await storedBook.text();
	}

	return null;
}

export async function saveBookContent(
	env: Bindings,
	bookId: string,
	content: string,
): Promise<void> {
	await env.books_g_ai.put(`book-${bookId}.txt`, content);
}
