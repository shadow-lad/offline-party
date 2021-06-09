import InputContainer from "./input-video";
import MainContainer from "./main-container";
import "../scss/style.scss";

function onDocumentLoad() {
	const main = document.querySelector("main");
	main.classList.remove("hide");

	new InputContainer({
		onValueChange: (videoURL) => {
			new MainContainer(videoURL);
		},
	});
}

document.body.onload = onDocumentLoad;
