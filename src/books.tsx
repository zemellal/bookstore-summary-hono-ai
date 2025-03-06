import { Hono } from "hono";
import { ErrorComponent } from "./components/error";
import { extractBookContent, getBookMetadata } from "./lib/bookUtils";
import { getErrorMessage } from "./lib/errorUtils";
import { BookDetailsPage } from "./pages/bookDetails";
import BookLibraryPage from "./pages/bookLibrary";
import { BookSummaryPage } from "./pages/bookSummary";
import { generateBookSummary } from "./services/aiService";
import {
	createBook,
	getAllBooks,
	getBookById,
	saveBookSummary,
} from "./services/bookDb";
import { fetchBookFromGutenberg } from "./services/bookFetcher";
import { getBookContent, saveBookContent } from "./services/bookStorage";
import type { Bindings } from "./types";

// Create a new Hono app for the book routes
const books = new Hono<{ Bindings: Bindings }>();

// Endpoint to fetch a book by ID
books.get("/:bookId", async (c) => {
	const bookId = c.req.param("bookId");

	try {
		// Check if we have book metadata in DB
		const bookRecord = await getBookById(c.env, bookId);

		// Check if we have the book content in R2
		let bookContent = await getBookContent(c.env, bookId);

		// If we're missing book content, fetch it from Gutenberg
		if (!bookContent) {
			try {
				// Fetch from Project Gutenberg
				bookContent = await fetchBookFromGutenberg(bookId);

				// Save the content to R2
				if (bookContent) {
					await saveBookContent(c.env, bookId, bookContent);
				} else {
					// No content was returned
					return c.render(
						<ErrorComponent
							title="Book Content Not Found"
							message={`Could not fetch content for book with ID ${bookId}`}
							returnUrl="/books"
							returnText="Return to Library"
						/>,
					);
				}
			} catch (fetchError) {
				return c.render(
					<ErrorComponent
						title="Book Content Error"
						message={`Failed to fetch book content for ID ${bookId}`}
						returnUrl="/books"
						returnText="Return to Library"
					/>,
				);
			}
		}

		// If we don't have the book record, try to fetch metadata
		if (!bookRecord) {
			try {
				// Fetch metadata from Gutenberg
				const metadata = await getBookMetadata(bookId);
				if (metadata) {
					// Create the book record
					await createBook(c.env, metadata);
					// Fetch the newly created record
					const newBookRecord = await getBookById(c.env, bookId);
					if (newBookRecord) {
						return c.render(<BookDetailsPage book={newBookRecord} />);
					}
				} else {
					// No metadata found
					return c.render(
						<ErrorComponent
							title="Book Not Found"
							message={`Could not find book with ID ${bookId}`}
							returnUrl="/books"
							returnText="Return to Library"
						/>,
					);
				}
			} catch (fetchError) {
				// If we can't fetch the metadata, show an error
				return c.render(
					<ErrorComponent
						title="Book Not Found"
						message={`Could not find book with ID ${bookId}`}
						returnUrl="/books"
						returnText="Return to Library"
					/>,
				);
			}
		} else {
			// We have the book record, render the page
			return c.render(<BookDetailsPage book={bookRecord} />);
		}

		// If we get here, something went wrong
		return c.render(
			<ErrorComponent
				title="Book Error"
				message={`Could not load book with ID ${bookId}`}
				returnUrl="/books"
				returnText="Return to Library"
			/>,
		);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		return c.render(
			<ErrorComponent
				title="Error Loading Book"
				message={errorMessage}
				returnUrl="/books"
				returnText="Return to Library"
			/>,
		);
	}
});

// books.get("/:bookId", async (c) => {
// 	const bookId = c.req.param("bookId");

// 	try {
// 		// Check if we have book metadata in DB
// 		const bookRecord = await getBookById(c.env, bookId);

// 		// Check if we have the book content in R2
// 		let bookContent = await getBookContent(c.env, bookId);

// 		if (bookContent) {
// 			// If we have the content but no DB record, try to create it now
// 			if (!bookRecord) {
// 				// Fetch metadata and store in DB
// 				const metadata = await getBookMetadata(bookId);
// 				if (metadata) {
// 					await createBook(c.env, metadata);
// 				}
// 			}

// 			// Return the content
// 			return c.text(bookContent);
// 		}

// 		// Book not found in R2, fetch from Project Gutenberg
// 		bookContent = await fetchBookFromGutenberg(bookId);

// 		// Save content to R2
// 		await saveBookContent(c.env, bookId, bookContent);

// 		// Fetch and save metadata
// 		const metadata = await getBookMetadata(bookId);
// 		if (metadata) {
// 			await createBook(c.env, metadata);
// 		}

// 		return c.text(bookContent);
// 	} catch (error) {
// 		const errorMessage = getErrorMessage(error);
// 		return c.text(`Error fetching book: ${errorMessage}`, 500);
// 	}
// });

// Endpoint to list fetched books - using R2 bucket
books.get("/", async (c) => {
	try {
		// Get all books from the database
		const bookRecords = await getAllBooks(c.env);
		return c.render(<BookLibraryPage books={bookRecords} />);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		return c.render(
			<ErrorComponent
				title="Error Listing Books"
				message={errorMessage}
				details={error}
			/>,
		);
	}
});

books.get("/:bookId/read", async (c) => {
	const bookId = c.req.param("bookId");

	try {
		// Check if we have the book content in R2
		let bookContent = await getBookContent(c.env, bookId);

		if (!bookContent) {
			// Book not found in R2, fetch from Project Gutenberg
			bookContent = await fetchBookFromGutenberg(bookId);

			// Save content to R2
			await saveBookContent(c.env, bookId, bookContent);

			// Fetch and save metadata if we don't have it yet
			const bookRecord = await getBookById(c.env, bookId);
			if (!bookRecord) {
				const metadata = await getBookMetadata(bookId);
				if (metadata) {
					await createBook(c.env, metadata);
				}
			}
		}

		// Return the content as plain text
		return c.text(bookContent);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		return c.text(`Error fetching book: ${errorMessage}`, 500);
	}
});

books.get("/:bookId/summary", async (c) => {
	const bookId = c.req.param("bookId");

	try {
		// First, get the book metadata from the database
		const bookRecord = await getBookById(c.env, bookId);

		// If we don't have the book in our database, return an error
		if (!bookRecord || !bookRecord.title) {
			return c.render(
				<ErrorComponent
					title="Book Not Found"
					message={`Cannot generate summary. Book with ID ${bookId} not found in our library.`}
					returnUrl="/books"
					returnText="Return to Library"
				/>,
			);
		}

		// Check if we already have a summary in the database
		if (bookRecord.summary) {
			return c.render(
				<BookSummaryPage
					bookTitle={bookRecord.title}
					summary={bookRecord.summary}
					bookId={bookId}
				/>,
			);
		}

		// No summary found, get book content from R2
		const bookContent = await getBookContent(c.env, bookId);
		if (!bookContent) {
			return c.render(
				<ErrorComponent
					title="Book Content Not Found"
					message={`Cannot generate summary. Book content for ${bookRecord.title} is not available.`}
					returnUrl="/books"
					returnText="Return to Library"
				/>,
			);
		}

		// Extract content between the Gutenberg markers using our helper function
		const extractedContent = extractBookContent(bookContent);

		// Generate the AI summary
		const result = await generateBookSummary(
			c.env,
			bookRecord.title,
			extractedContent,
		);

		// Only save successful summaries to the database
		if (result.success) {
			await saveBookSummary(c.env, bookId, result.summary);
		}

		// Render the summary page
		return c.render(
			<BookSummaryPage
				bookTitle={bookRecord.title}
				summary={result.summary}
				bookId={bookId}
			/>,
		);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		return c.render(
			<ErrorComponent
				title="Error Generating Summary"
				message={errorMessage}
			/>,
		);
	}
});

export default books;
