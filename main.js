const apiUrl = "https://script.google.com/macros/s/AKfycbxnbc1uctasjKX2rK--JUeO0Gun5HKwbkIvT12j_zZMMfS7EwxwbslKgMc-hqw0z7ux/exec";
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
		{ once: true },
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
					td.innerHTML = `${value}`;
					tr.appendChild(td);
				});

				const td = document.createElement("td");
				td.classList.add("actions");

				const btnsContainer = document.createElement("div");
				btnsContainer.classList.add("btns-container");

				const editButton = document.createElement("i");
				editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");

				const deleteButton = document.createElement("i");
				deleteButton.classList.add("fa-solid", "fa-trash", "delete");

				const menuToggle = document.createElement("i");
				menuToggle.classList.add("fa-solid", "fa-ellipsis-vertical", "menu-toggle");

				btnsContainer.appendChild(editButton);
				btnsContainer.appendChild(deleteButton);
				td.appendChild(btnsContainer);
				td.appendChild(menuToggle);
				tr.appendChild(td);

				tableBody.appendChild(tr);
			}
		});
	} catch (err) {
		showErrorMessage(errorElement, "unable to get data");
		console.error("getData error:", err);
	}
}

let editingRow = null;
const inputName = document.querySelector("input[type=text]");
const inputAge = document.querySelector("input[type=number]");
const addButton = document.querySelector("button.post");
const cancelButton = document.querySelector("button.cancel");

// menu toggle, delete, and edit
tableBody.addEventListener("click", async (e) => {
	const menuToggle = e.target.closest(".menu-toggle");
	if (menuToggle) {
		const currentActions = menuToggle.closest(".actions");

		document.querySelectorAll(".actions.open").forEach((el) => {
			if (el !== currentActions) el.classList.remove("open");
		});

		currentActions.classList.toggle("open");
		return;
	}

	const editIcon = e.target.closest(".edit");
	if (editIcon) {
		const row = e.target.closest("tr");
		const cells = row.querySelectorAll("td");

		const name = cells[0].childNodes[0].textContent.trim();
		const age = cells[1].childNodes[0].textContent.trim();

		inputName.value = name;
		inputAge.value = age;

		editingRow = row.dataset.id;
		addButton.textContent = "Update User";
		cancelButton.classList.add("show");

		inputName.focus();
		return;
	}

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

// close open menu when clicking outside
document.addEventListener("click", (e) => {
	if (e.target.closest(".actions")) return;
	document.querySelectorAll(".actions.open").forEach((el) => el.classList.remove("open"));
});

// add and update
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

	const isEditing = editingRow !== null;

	addButton.disabled = true;
	addButton.textContent = isEditing ? "Updating..." : "Adding...";

	try {
		const body = isEditing
			? {
					action: "update",
					row: editingRow,
					name: inputName.value,
					age: inputAge.value,
				}
			: {
					action: "addUser",
					name: inputName.value,
					age: inputAge.value,
				};

		const post = await fetch(apiUrl, {
			method: "POST",
			body: JSON.stringify(body),
		});

		const dataToPost = await post.text();

		if (dataToPost.trim().toLowerCase() === "success") {
			getData();
			inputName.value = "";
			inputAge.value = "";
			editingRow = null;
			cancelButton.classList.remove("show");
		} else {
			throw new Error(dataToPost);
		}
	} catch (err) {
		showErrorMessage(errorElement, isEditing ? "unable to update" : "unable to add user");
		console.error(isEditing ? "update error:" : "addUser error:", err);
	} finally {
		addButton.disabled = false;
		addButton.textContent = editingRow === null ? "Add User" : "Update User";
	}
});

cancelButton.addEventListener("click", () => {
	editingRow = null;
	inputName.value = "";
	inputAge.value = "";
	addButton.textContent = "Add User";
	cancelButton.classList.remove("show");
});

getData();