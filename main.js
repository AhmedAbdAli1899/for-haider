const apiUrl = "https://script.google.com/macros/s/AKfycbxT5CsHa11a7eQJFkLe2uP27Zqow6RECfsKSfE-3Ycsh8lJAUG0KdCkSS8rdHlAkbL4/exec";
const tableHead = document.querySelector("thead");
const tableBody = document.querySelector("tbody");

function showErrorMessage(errorElement, message) {
	errorElement.textContent = message;
	errorElement.classList.remove("display-block");
	setTimeout(() => {
		errorElement.classList.add("display-block");
	}, 100);

	errorElement.addEventListener(
		"animationend",
		() => {
			errorElement.classList.remove("display-block");
		},
		{ once: true }
	);
}

const errorElement = document.querySelector("p.error");

async function getData() {
	try {
		const res = await fetch(apiUrl);

		const data = await res.json();

		tableHead.innerHTML = "";
		tableBody.innerHTML = "";

		data.forEach((user, index) => {
			if (index === 0) {
				const tr = document.createElement("tr");

				user.forEach((key) => {
					const th = document.createElement("th");
					th.textContent = key;
					tr.appendChild(th);
				});

				tableHead.appendChild(tr);
			} else {
				const isEmpty = user.every((value) => value === "");
				if (isEmpty) return;

				const tr = document.createElement("tr");
				tr.setAttribute("data-id", index + 1);

				user.forEach((value) => {
					const td = document.createElement("td");
					td.textContent = value;
					tr.appendChild(td);
				});

				const td = document.createElement("td");
				td.classList.add("delete");
				const deleteButton = document.createElement("i");
				deleteButton.classList.add("fa-solid", "fa-trash");
				td.appendChild(deleteButton);
				tr.appendChild(td);

				tableBody.appendChild(tr);
			}
		});
	} catch (err) {
		showErrorMessage(errorElement, "unable to get data");
		console.error("getData error:", err);
	}
}

// delete
tableBody.addEventListener("click", async (e) => {
	const deleteIcon = e.target.closest(".delete");
	if (!deleteIcon) return;

	if (deleteIcon.classList.contains("deleting")) return;

	const row = e.target.closest("tr");
	const id = row.dataset.id;

	deleteIcon.classList.add("deleting");

	try {
		const res = await fetch(apiUrl, {
			method: "POST",
			body: JSON.stringify({
				action: "delete",
				row: id,
			}),
		});

		const data = await res.text();

		if (data.trim().toLowerCase() === "success") {
			getData();
		} else {
			throw new Error(data);
		}
	} catch (err) {
		showErrorMessage(errorElement, "unable to delete user");
		console.error("delete error:", err);
		deleteIcon.classList.remove("deleting");
	}
});

const inputName = document.querySelector("input[type=text]");
const inputAge = document.querySelector("input[type=number]");
const addButton = document.querySelector("button.post");

addButton.addEventListener("click", async () => {
	if (inputName.value.trim() === "" || inputAge.value.trim() === "") {
		showErrorMessage(errorElement, "Please enter name and age");

		if (inputName.value.trim() === "") {
			inputName.focus();
		} else {
			inputAge.focus();
		}

		return;
	}

	addButton.disabled = true;
	addButton.textContent = "Adding...";

	try {
		const post = await fetch(apiUrl, {
			method: "POST",
			body: JSON.stringify({
				action: "addUser",
				name: inputName.value,
				age: inputAge.value,
			}),
		});


		const dataToPost = await post.text();

		if (dataToPost.trim().toLowerCase() === "success") {
			getData();
			inputName.value = "";
			inputAge.value = "";
		} else {
			throw new Error(dataToPost);
		}
	} catch (err) {
		showErrorMessage(errorElement, "فشل إضافة المستخدم، حاول مرة أخرى");
		console.error("addUser error:", err);
	} finally {
		addButton.disabled = false;
		addButton.textContent = "Add User";
	}
});

getData();