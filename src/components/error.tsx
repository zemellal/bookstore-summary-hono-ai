export function ErrorComponent({
	title = "Error",
	message,
	returnUrl = "/",
	returnText = "Return Home",
	details = null,
}: {
	title?: string;
	message: string;
	returnUrl?: string;
	returnText?: string;
	details?: unknown;
}) {
	return (
		<div>
			<h1>{title}</h1>
			<p>{message}</p>
			{details && <pre>{JSON.stringify(details, null, 2)}</pre>}
			<a href={returnUrl} className="btn">
				{returnText}
			</a>
		</div>
	);
}
