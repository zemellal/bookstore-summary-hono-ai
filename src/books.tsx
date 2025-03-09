import { Hono } from "hono";
import { ErrorComponent } from "./components/error";
import { extractBookContent, getBookMetadata } from "./lib/bookUtils";
import { getErrorMessage } from "./lib/errorUtils";
import BookDetailsPage from "./pages/bookDetails";
import BookLibraryPage from "./pages/bookLibrary";
import BookSummaryPage from "./pages/bookSummary";
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

// Endpoint to create a new book
books.post("/", async (c) => {
	try {
		const { bookId } = await c.req.parseBody();

		// check that bookId is a string
		if (typeof bookId !== "string") {
			return c.json({ error: "Invalid bookId" }, 400);
		}

		// First, check if book already exists in our database
		const existingBook = await getBookById(c.env, bookId);

		// If book already exists, just redirect to the book details page
		if (existingBook) {
			return c.redirect(`/books/${bookId}`);
		}

		// Book doesn't exist - fetch book content from Project Gutenberg
		const bookContent = await fetchBookFromGutenberg(bookId);

		if (!bookContent) {
			return c.render(
				<ErrorComponent
					title="Book Content Not Found"
					message={`Could not fetch content for book with ID ${bookId}`}
					returnUrl="/"
					returnText="Home"
				/>,
			);
		}

		// Fetch metadata
		const metadata = await getBookMetadata(bookId);
		if (!metadata) {
			return c.render(
				<ErrorComponent
					title="Book Not Found"
					message={`Could not find metadata for book with ID ${bookId}`}
					returnUrl="/"
					returnText="Home"
				/>,
			);
		}

		// Both content and metadata fetched successfully - now save them

		// Save content to R2
		await saveBookContent(c.env, bookId, bookContent);

		// Save the book metadata to the database
		await createBook(c.env, metadata);

		// Redirect to the book details page
		return c.redirect(`/books/${bookId}`);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		return c.render(
			<ErrorComponent
				title="Error Creating Book"
				message={errorMessage}
				returnUrl="/"
				returnText="Home"
			/>,
		);
	}
});

// Endpoint to fetch a book by ID
books.get("/:bookId", async (c) => {
	const bookId = c.req.param("bookId");

	try {
		// Get book metadata from DB
		const bookRecord = await getBookById(c.env, bookId);

		// If book doesn't exist in our database, show error
		if (!bookRecord) {
			return c.render(
				<ErrorComponent
					title="Book Not Found"
					message={`Book with ID ${bookId} not found in our library.`}
					returnUrl="/"
					returnText="Return Home"
				/>,
			);
		}

		// Book exists, render the book details page
		return c.render(<BookDetailsPage book={bookRecord} />);
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

// Endpoint to read a book - using R2 bucket
books.get("/:bookId/read", async (c) => {
	const bookId = c.req.param("bookId");

	try {
		// Check if we have the book content in R2
		const bookContent = await getBookContent(c.env, bookId);

		if (!bookContent) {
			return c.render(
				<ErrorComponent
					title="Book Not Found"
					message={`Book with ID ${bookId} not found in our library. Return Home to create a new book.`}
					returnUrl="/"
					returnText="Return Home"
				/>,
			);
		}

		// Return the content as plain text
		return c.text(bookContent);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		return c.render(
			<ErrorComponent
				title="Error loading book"
				message={`Book not found: ${errorMessage}`}
				details={error}
				returnUrl="/"
				returnText="Return Home"
			/>,
		);
	}
});

// Endpoint to get or generate a summary of a book
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
