import type { BookData } from "../services/bookDb";
import { fetchBookMetadataHtml } from "../services/bookFetcher";

// Maximum number of characters to extract for book summaries
export const MAX_SUMMARY_CONTENT_LENGTH = 10000;

/**
 * Extracts the content of a book from its HTML representation.
 * @param bookContent The HTML content of the book.
 * @returns The extracted content.
 */
export function extractBookContent(bookContent: string): string {
	const startMarkerRegex = /\*\*\* START [^*]*\*\*\*/i;
	const endMarkerRegex = /\*\*\* END [^*]*\*\*\*/i;

	const startMatch = startMarkerRegex.exec(bookContent);
	const endMatch = endMarkerRegex.exec(bookContent);

	if (startMatch && endMatch && startMatch.index < endMatch.index) {
		// Get content between markers, adding a bit after start marker
		const startPos = startMatch.index + startMatch[0].length;
		const endPos = endMatch.index;

		// Extract a reasonable amount of text
		return bookContent
			.substring(
				startPos,
				Math.min(startPos + MAX_SUMMARY_CONTENT_LENGTH, endPos),
			)
			.trim();
	}
	// Fallback: just use the first N chars if markers aren't found
	return bookContent.substring(0, MAX_SUMMARY_CONTENT_LENGTH).trim();
}

export async function getBookMetadata(
	bookId: string,
): Promise<BookData | null> {
	const metadata = await extractBookMetadata(bookId);

	if (!metadata || !metadata.title) {
		return null;
	}

	return {
		id: bookId,
		title: metadata.title,
		author: metadata.author,
		description: metadata.description,
		keywords: metadata.keywords,
		classification: metadata.classification,
		r2_path: `book-${bookId}.txt`,
	};
}

/**
 * Fetches book metadata from Project Gutenberg and extracts key information.
 */
export async function extractBookMetadata(bookId: string) {
	const html = await fetchBookMetadataHtml(bookId);

	if (!html) {
		return null;
	}

	// Basic parsing to extract metadata from the page
	const getMetaContent = (name: string) => {
		const regex = new RegExp(
			`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`,
			"i",
		);
		const match = html.match(regex);
		return match ? match[1] : "";
	};

	// Extract using regex for itemprop elements (not as robust as DOM parsing)
	const getItemPropContent = (propName: string) => {
		const regex = new RegExp(
			`<[^>]*itemprop=["']${propName}["'][^>]*>([^<]*)<`,
			"i",
		);
		const match = html.match(regex);
		return match ? match[1].trim() : "";
	};

	return {
		title: getItemPropContent("headline"),
		author: getItemPropContent("creator"),
		description: getMetaContent("description"),
		keywords: getMetaContent("keywords"),
		classification: getMetaContent("classification"),
	};
}
