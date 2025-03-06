import { describe, expect, test } from "bun:test";
import { extractBookContent } from "./bookUtils";

describe("extractBookContent", () => {
	test("extracts content between start and end markers", () => {
		const fakeBookContent = `
      Some header info
      *** START OF THE PROJECT GUTENBERG EBOOK SAMPLE BOOK ***
      This is the actual book content that should be extracted.
      It spans multiple lines and contains the important text.
      *** END OF THE PROJECT GUTENBERG EBOOK SAMPLE BOOK ***
      Some footer information
    `;

		const result = extractBookContent(fakeBookContent);
		expect(result).toContain("This is the actual book content");
		expect(result).toContain("spans multiple lines");
		expect(result).not.toContain("Some header info");
		expect(result).not.toContain("Some footer information");
	});

	test("handles different START marker formats", () => {
		const fakeBookContent = `
      *** START OF THIS PROJECT GUTENBERG EBOOK DIFFERENT FORMAT ***
      This should still be extracted.
      *** END OF THIS PROJECT GUTENBERG EBOOK DIFFERENT FORMAT ***
    `;

		const result = extractBookContent(fakeBookContent);
		expect(result).toContain("This should still be extracted");
	});

	test("handles mixed case markers", () => {
		const fakeBookContent = `
      *** Start of the Project Gutenberg EBook Some Title ***
      Mixed case content.
      *** End of the Project Gutenberg EBook Some Title ***
    `;

		const result = extractBookContent(fakeBookContent);
		expect(result).toContain("Mixed case content");
	});

	test("limits extracted content to 10000 characters", () => {
		// Create a very large content between markers
		const largeContent = "X".repeat(15000);
		const fakeBookContent = `
      *** START OF THE PROJECT GUTENBERG EBOOK LARGE BOOK ***
      ${largeContent}
      *** END OF THE PROJECT GUTENBERG EBOOK LARGE BOOK ***
    `;

		const result = extractBookContent(fakeBookContent);
		expect(result.length).toBeLessThanOrEqual(10000);
	});

	test("falls back to first 10000 characters if no markers found", () => {
		const noMarkersContent = `Content without any proper Gutenberg markers. ${"X".repeat(12000)}`;

		const result = extractBookContent(noMarkersContent);
		expect(result.length).toBeLessThanOrEqual(10000);
		expect(result).toContain("Content without any proper Gutenberg markers");
	});

	test("falls back if only start marker is found", () => {
		const startOnlyContent = `
      Some prefix text
      *** START OF THE PROJECT GUTENBERG EBOOK INCOMPLETE ***
      This book has no end marker.
      ${"More text here. ".repeat(1000)}
    `;

		const result = extractBookContent(startOnlyContent);
		expect(result.length).toBeLessThanOrEqual(10000);
	});

	test("falls back if only end marker is found", () => {
		const endOnlyContent = `
      Some content without a start marker.
      ${"Some text. ".repeat(1000)}
      *** END OF THE PROJECT GUTENBERG EBOOK INCOMPLETE ***
    `;

		const result = extractBookContent(endOnlyContent);
		expect(result.length).toBeLessThanOrEqual(10000);
	});

	test("falls back if markers are in wrong order", () => {
		const wrongOrderContent = `
      Some prefix
      *** END OF THE PROJECT GUTENBERG EBOOK WRONG ORDER ***
      This content has markers in the wrong order.
      *** START OF THE PROJECT GUTENBERG EBOOK WRONG ORDER ***
      Some suffix
    `;

		const result = extractBookContent(wrongOrderContent);
		expect(result.length).toBeLessThanOrEqual(10000);
		expect(result).toContain("Some prefix");
	});

	test("properly trims extracted content", () => {
		const contentWithWhitespace = `
      *** START OF THE PROJECT GUTENBERG EBOOK WHITESPACE ***


      This content has whitespace that should be trimmed.


      *** END OF THE PROJECT GUTENBERG EBOOK WHITESPACE ***
    `;

		const result = extractBookContent(contentWithWhitespace);
		expect(result).toBe("This content has whitespace that should be trimmed.");
	});
});
