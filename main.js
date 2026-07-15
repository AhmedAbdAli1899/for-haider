document.querySelector("button.get").addEventListener("click", async () => {
	const res = await fetch("https://script.google.com/macros/s/AKfycbzVzwAbaHCaHU9ORkPX30W80o-yX2O7LuQxey9cRNM9BiBq2KmjhBotmH15hB53Vxm2/exec");
	const data = await res.json();

	let result = document.querySelector(".result");
	result.innerHTML = "";
	data.forEach((row) => {
		const p = document.createElement("p");
		row
			.forEach((cell) => {
				p.textContent += cell + " ";
			})
			result.appendChild(p);
	});
});

const inputName = document.querySelector("input[type=text]");
const inputAge = document.querySelector("input[type=number]");

document.querySelector("button.post").addEventListener("click", async () => {
	const user = {
		name: inputName.value || "unknown name",
		age: inputAge.value || "unknown age",
	};

	const post = await fetch("https://script.google.com/macros/s/AKfycbzVzwAbaHCaHU9ORkPX30W80o-yX2O7LuQxey9cRNM9BiBq2KmjhBotmH15hB53Vxm2/exec", {
		method: "POST",
		body: JSON.stringify(user),
	});

	const dataToPost = await post.text();

    inputName.value = "";
	inputAge.value = "";
});
