export async function fetchBookFromGutenberg(bookId: string): Promise<string> {
	// const gutenbergUrl = `https://gutenberg.org/ebooks/${bookId}.txt.utf-8`;
	const gutenbergUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
	const response = await fetch(gutenbergUrl);

	if (!response.ok) {
		console.error(`Failed to fetch book with ID: ${bookId}`);
		throw new Error(`Failed to fetch book with ID: ${bookId}`);
	}

	return await response.text();
}

/*
Please do not use this for scraping, but one id at a time occasionally is ok.
<!--
DON'T USE THIS PAGE FOR SCRAPING.
Seriously. You'll only get your IP blocked.
Read https://www.gutenberg.org/feeds/ to learn how to download Project
Gutenberg metadata much faster than by scraping.
-->
*/

export async function fetchBookMetadataHtml(
	bookId: string,
): Promise<string | null> {
	const metadataUrl = `https://www.gutenberg.org/ebooks/${bookId}`;
	const response = await fetch(metadataUrl);

	if (!response.ok) {
		return null;
	}

	return await response.text();
}
