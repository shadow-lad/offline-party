import VIDEO_IMAGE_SRC from "../assets/img/video.png";
import UPLOAD_IMAGE_SRC from "../assets/img/upload.png";

const readyImages = async () => {
	let param1 = "/assets/img/video.png";
	let param2 = "/assets/img/upload.png";
	let res = await fetch(VIDEO_IMAGE_SRC);
	if (res.ok) param1 = URL.createObjectURL(await res.blob());
	res = await fetch(UPLOAD_IMAGE_SRC);
	if (res.ok) param2 = URL.createObjectURL(await res.blob());
	return [param1, param2];
};

class InputContainer {
	constructor({ onValueChange }) {
		readyImages().then(([image1, image2]) => {
			this.video = { url: image1, text: "Click here or Drag and Drop File" };
			this.upload = { url: image2, text: "Drop Here" };
		}); // PRELOADING IMAGES

		this.inputContainer = document.querySelector("#input");
		this.videoInput = document.querySelector("#videoInput");

		this.img = this.inputContainer.querySelector("img");
		this.videoInputText = this.inputContainer.querySelector("h1");
		this.onValueChange = onValueChange;
		this.setListeners();
	}

	setImg({ url, text }) {
		this.img.src = url;
		this.videoInputText.innerText = text;
	}

	setVideoImg() {
		this.setImg(this.video);
	}

	setUploadImg() {
		this.setImg(this.upload);
		console.log("here!");
	}

	setListeners() {
		this.videoInput.addEventListener(
			"dragover",
			this.setUploadImg.bind(this)
		);
		this.videoInput.addEventListener(
			"dragleave",
			this.setVideoImg.bind(this)
		);
		this.videoInput.addEventListener("drop", this.setVideoImg.bind(this));
		this.videoInput.addEventListener("change", () => {
			this.setVideoImg();
			this.inputContainer.remove();
			this.onValueChange(URL.createObjectURL(this.videoInput.files[0]));
		});
	}
}

export default InputContainer;
