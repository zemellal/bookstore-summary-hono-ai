import type { Bindings } from "../types";

interface SummaryResult {
	success: boolean;
	summary: string;
	error?: string;
}

export async function generateBookSummary(
	env: Bindings,
	bookTitle: string,
	bookContent?: string,
): Promise<SummaryResult> {
	try {
		let prompt: string;
		const systemPrompt =
			"You are an AI assistant with expert knowledge in literature that helps users summarize books.";
		const model = "@cf/meta/llama-3-8b-instruct";

		if (bookContent) {
			prompt = `Please write a brief summary of the following book content. Focus on the main themes, plot, and characters:

${bookContent}`;
		} else {
			// Fallback to using just the title if no content is provided
			prompt = `Can you write a one paragraph summary of the popular book: ${bookTitle}?`;
		}

		const { response: answer } = await env.AI.run(model, {
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: prompt,
				},
			],
		});

		return {
			success: true,
			summary: answer,
		};
	} catch (error) {
		if (error instanceof Error) {
			if (
				error.message.includes("too long") ||
				error.message.includes("token limit")
			) {
				return {
					success: false,
					summary:
						"The book content was too long to process for an AI summary. Please try with a shorter excerpt or check back later for an improved version.",
					error: "Content too long for AI processing",
				};
			}
			return {
				success: false,
				summary: `Error generating summary: ${error.message}`,
				error: error.message,
			};
		}
		return {
			success: false,
			summary: "An unknown error occurred while generating the summary",
			error: "Unknown error",
		};
	}
}
