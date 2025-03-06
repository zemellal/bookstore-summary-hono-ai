import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = jsxRenderer(({ children }) => {
	return (
		<html lang="en">
			<head>
				{import.meta.env.PROD ? (
					<link href="/static/style.css" rel="stylesheet" />
				) : (
					<link href="/src/style.css" rel="stylesheet" />
				)}
				{import.meta.env.PROD ? (
					<script type="module" src="/static/client.js" />
				) : (
					<script type="module" src="/src/client.ts" />
				)}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body>{children}</body>
		</html>
	);
});
