export function BookSearchForm() {
	return (
		<div style={{ marginBottom: "1rem" }}>
			<h2>Get a Book by ID</h2>
			<form
				action="/books"
				method="get"
				onSubmit="event.preventDefault(); window.location.href = '/books/' + document.getElementById('bookId').value;"
			>
				<div className="form-group">
					<label
						htmlFor="bookId"
						style={{ display: "block", marginBottom: "5px" }}
					>
						Enter Project Gutenberg Book ID:
					</label>

					<div className="input-group">
						<input
							type="number"
							id="bookId"
							name="bookId"
							min="1"
							placeholder="e.g. 84 for Frankenstein"
							required
							className="input"
						/>
						<button type="submit" className="btn btn-primary">
							Get Book
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
