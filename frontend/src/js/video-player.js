import { timeFormat } from "./utils";

class VideoPlayer {
	constructor(videoURL) {
		this.videoContainer = document.querySelector(".video-container");
		this.videoControls = this.videoContainer.querySelector(".video-controls");
		this.videoOverlay = document.querySelector(".video-overlay");
		this.video = document.querySelector("video");

		this.videoContainerHasFocus = true;

		this.controlsTimeout = null;

		this.progressBar = document.querySelector(".progress-bar");
		this.progress = this.progressBar.querySelector(".progress");
		this.seeker = this.progress.querySelector(".seeker");

		this.fullscreenButton = document.querySelector("#fullscreen");

		this.timeText = document.querySelector(".extra-text .time");

		this.playbackButtons = document.querySelectorAll(
			".playback-controls button"
		);

		for (var x of this.playbackButtons) {
			const action = x.dataset["action"];

			if (action === "play-pause") {
				this.playPauseButton = x;
			}

			if (action === "volume") {
				this.volumeButton = x;
			}
		}

		this.volumeBar = document.querySelector(".volume-bar");
		this.volume = this.volumeBar.querySelector(".volume");
		this.volumeSeeker = this.volume.querySelector(".seeker");

		this.volumeLevel = 1;

		this.video.addEventListener("loadedmetadata", () => this.setTime(0));
		this.video.src = videoURL;

		this.initializeListeners();

		this.videoContainer.focus();
	}

	displayInfoIcon(iconName) {
		const div = document.createElement("div");
		div.classList.add("material-icons");
		div.classList.add("icon-info");
		div.innerHTML = iconName;

		this.videoContainer.appendChild(div);
		setTimeout(() => div.remove(), 1000);
	}

	playVideo() {
		this.video.play();
	}

	pauseVideo() {
		this.video.pause();
	}

	onVideoPlayed() {
		this.playing = true;
		if (this.onPlay) this.onPlay();
		this.playPauseButton.firstElementChild.innerText = "pause";
		this.displayInfoIcon("play_arrow");
	}

	onVideoPaused() {
		this.playing = false;
		if (this.onPause) this.onPause();
		this.playPauseButton.firstElementChild.innerText = "play_arrow";
		this.displayInfoIcon("pause");
	}

	togglePlay() {
		this.videoContainer.focus();
		const currentState = this.playPauseButton.firstElementChild.innerText;

		if (currentState === "play_arrow") this.video.play();
		else this.video.pause();
	}

	seekBy(duration) {
		this.videoContainer.focus();
		this.seekTo(this.video.currentTime + duration);
		if (duration === 10) {
			this.displayInfoIcon("forward_10");
		} else if (duration === -10) {
			this.displayInfoIcon("replay_10");
		}
	}

	seekTo(time) {
		this.video.currentTime = time;
	}

	seeking(event) {
		const position = event.clientX - this.progressBar.offsetLeft;
		const total = this.progressBar.clientWidth - this.progressBar.offsetLeft;

		const percentage = position / total;

		const time = percentage * this.video.duration;
		this.seekTo(time);
	}

	dragSeeker(event) {
		const position = event.clientX - this.progressBar.clientLeft;
		const width = this.progressBar.clientWidth;

		this.percentage = position / width;
		this.progress.style.width = `${this.percentage * 100}%`;
		this.setTime(this.percentage);
	}

	dragSeekerFinish() {
		document.onmouseup = null;
		document.onmousemove = null;
		if (this.wasPlaying) {
			this.video.play();
		}

		this.seekTo(this.video.duration * this.percentage);
	}

	toggleFullscreen() {
		this.videoContainer.focus();
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.body.requestFullscreen();
		}
	}

	decreaseVolume() {
		if (this.video.volume < 0.05) this.setVolume(0);
		else this.setVolume(this.video.volume - 0.05);
		this.displayInfoIcon("volume_down");
	}

	increaseVolume() {
		if (this.video.volume > 0.95) this.setVolume(1);
		else this.setVolume(this.video.volume + 0.05);
		this.displayInfoIcon("volume_up");
	}

	setVolume(value, isButton = false) {
		if (value < 0) value = 0;
		if (value > 1) value = 1;
		this.volume.style.width = `${value * 100}%`;
		this.video.volume = value;
		if (!isButton) {
			this.volumeLevel = value;
		}

		const icon =
			value === 0
				? "volume_mute"
				: value <= 0.5
				? "volume_down"
				: "volume_up";

		this.volumeButton.firstElementChild.innerText = icon;
		if (isButton) this.displayInfoIcon(icon);
	}

	toggleMute() {
		this.videoContainer.focus();
		if (this.volumeButton.firstElementChild.innerText !== "volume_mute") {
			this.setVolume(0, true);
		} else {
			this.setVolume(this.volumeLevel, true);
		}
	}

	changeVolume(event) {
		const position = event.clientX - this.volumeBar.offsetLeft;
		const total = this.volumeBar.clientWidth;

		const percentage = (position / total).toFixed(2);

		this.setVolume(percentage);
	}

	dragVolumeSeeker(event) {
		const position = event.clientX - this.volumeBar.offsetLeft;
		const width = this.volumeBar.clientWidth;

		if (position > width) {
			return;
		}

		const percentage = (position / width).toFixed(2);
		this.setVolume(percentage);
	}

	dragVolumeSeekerFinish() {
		document.onmouseup = null;
		document.onmousemove = null;
	}

	setTime(percentage) {
		const time = timeFormat(percentage * this.video.duration);
		const totalTime = timeFormat(this.video.duration);

		this.timeText.innerText = `${time} / ${totalTime}`;
	}

	getPlaybackFunction(action) {
		switch (action) {
			case "play-pause":
				return this.togglePlay.bind(this);
			case "forward":
				return () => this.seekBy(10);
			case "rewind":
				return () => this.seekBy(-10);
			case "volume":
				return this.toggleMute.bind(this);
		}
	}

	initializeControls() {
		this.fullscreenButton.addEventListener(
			"click",
			this.toggleFullscreen.bind(this)
		);

		document.addEventListener("fullscreenchange", () => {
			if (document.fullscreenElement) {
				this.fullscreenButton.firstElementChild.innerText =
					"fullscreen_exit";
				this.displayInfoIcon("fullscreen");
			} else {
				this.fullscreenButton.firstElementChild.innerHTML = "fullscreen";
				this.displayInfoIcon("fullscreen_exit");
			}
		});

		this.progressBar.addEventListener("click", this.seeking.bind(this));
		this.volumeBar.addEventListener("click", this.changeVolume.bind(this));

		this.seeker.addEventListener("mousedown", () => {
			this.video.pause();
			this.wasPlaying = this.playing;
			document.onmousemove = this.dragSeeker.bind(this);
			document.onmouseup = this.dragSeekerFinish.bind(this);
		});

		this.volumeSeeker.addEventListener("mousedown", () => {
			document.onmousemove = this.dragVolumeSeeker.bind(this);
			document.onmouseup = this.dragVolumeSeekerFinish.bind(this);
		});

		for (let button of this.playbackButtons) {
			const action = button.dataset["action"];
			button.addEventListener("click", this.getPlaybackFunction(action));
		}
	}

	initializeVideo() {
		this.video.addEventListener("timeupdate", () => {
			const percentage = this.video.currentTime / this.video.duration;
			this.progress.style.width = `${percentage * 100}%`;
			this.setTime(percentage);
		});

		this.video.addEventListener("play", this.onVideoPlayed.bind(this));
		this.video.addEventListener("pause", this.onVideoPaused.bind(this));
		this.video.addEventListener(
			"seeked",
			() => this.onSeek && this.onSeek(this.video.currentTime)
		);
	}

	initializeVideoContainer() {
		this.videoContainer.addEventListener("keyup", (event) => {
			if (event.key === " ") {
				this.togglePlay();
				return;
			}

			if (event.key === "ArrowLeft") {
				this.seekBy(-10);
				return;
			}

			if (event.key === "ArrowRight") {
				this.seekBy(10);
				return;
			}

			if (event.key === "f") {
				this.toggleFullscreen();
				return;
			}

			if (event.key === "m") {
				this.toggleMute();
				return;
			}

			if (event.key === "ArrowUp") {
				this.increaseVolume();
				return;
			}

			if (event.key === "ArrowDown") {
				this.decreaseVolume();
				return;
			}
		});

		this.videoContainer.addEventListener("blur", () => {
			this.videoContainerHasFocus = false;
		});

		this.videoControls.addEventListener("click", (event) => {
			event.stopPropagation();
			this.videoContainerHasFocus = true;
		});

		this.videoContainer.addEventListener("mousemove", () => {
			if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
			this.videoControls.style.transform = "translateY(0)";
			this.controlsTimeout = setTimeout(() => {
				this.videoControls.style.transform = "translateY(100%)";
			}, 2500);
		});

		this.videoContainer.addEventListener("click", () => {
			if (!this.videoContainerHasFocus)
				return (this.videoContainerHasFocus = true);
			this.clickTimeout = setTimeout(() => {
				if (!this.prevent) this.togglePlay();
			}, 200);
			this.prevent = false;
		});

		this.videoContainer.addEventListener("dblclick", () => {
			clearTimeout(this.clickTimeout);
			this.prevent = true;
			this.toggleFullscreen();
		});
	}

	setOnPlay(fn) {
		this.onPlay = fn;
	}

	setOnPause(fn) {
		this.onPause = fn;
	}

	setOnSeek(fn) {
		this.onSeek = fn;
	}

	initializeListeners() {
		this.playing = false;
		this.percentage = 0;
		this.wasPlaying = this.playing;

		this.initializeVideo();
		this.initializeControls();
		this.initializeVideoContainer();
	}
}

export default VideoPlayer;
