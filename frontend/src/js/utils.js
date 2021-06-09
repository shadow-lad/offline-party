export const toastMessage = (message) => {
	const div = document.createElement("div");
	div.classList.add("toast-message");
	div.innerText = `${message}`;
	document.body.appendChild(div);
	setTimeout(() => {
		div.remove();
	}, 5000);
};

export const timeFormat = (time) => {
	return new Date(time * 1000).toISOString().substr(11, 8);
};
