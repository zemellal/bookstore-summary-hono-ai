import { Hono } from "hono";
import books from "./books";
import { ErrorComponent } from "./components/error";
import { getErrorMessage } from "./lib/errorUtils";
import HomePage from "./pages/home";
import { renderer } from "./renderer";
import { getName, setName } from "./services/kvService";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("*", renderer);

app.get("/test", async (c) => {
	return c.json({ message: "Hello, World!", data: { myName: c.env.MY_NAME } });
});

app.get("/", async (c) => {
	try {
		// Store name in KV if it doesn't exist yet
		await setName(c.env, c.env.MY_NAME);

		// Get name from KV
		const name = (await getName(c.env)) || "Anonymous";

		// Render home page
		return c.render(<HomePage name={name} />);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		return c.render(
			<ErrorComponent
				title="Error Loading Home Page"
				message={errorMessage}
				returnUrl="/"
				returnText="Try Again"
			/>,
		);
	}
});

// Mount the books routes
app.route("/books", books);

export default app;
