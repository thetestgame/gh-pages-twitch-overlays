///////////////////////////
// STREAMELEMENTS FIELDS //
///////////////////////////

let sbServerAddress = "127.0.0.1";
let sbServerPort = "8080";
let sbDebugMode = true;
let sbAdRun;
let sbAdMidRoll;
let barColor = "#ffcc00";
let lineThickness = 10;
let barPosition = "Bottom";			// None, Bottom, Top, Left, Right
let timerPosition = "Top Left";		// None, Top Left, Top Right, Bottom Left, Bottom Right
let showMidRollCountdown = "Yes";	// No, Yes
let testDuration = 5;

/////////////////
// GLOBAL VARS //
/////////////////

let ws;
let singleAdLength = 30;



///////////////////////////////////
// SRTEAMER.BOT WEBSOCKET SERVER //
///////////////////////////////////

// This is the main function that connects to the Streamer.bot websocket server
function connectws() {
	if ("WebSocket" in window) {
		ws = new WebSocket("ws://" + sbServerAddress + ":" + sbServerPort + "/");

		// Reconnect
		ws.onclose = function () {
			SetConnectionStatus(false);
			setTimeout(connectws, 5000);
		};

		// Connect
		ws.onopen = async function () {
			SetConnectionStatus(true);

			console.log("Subscribe to events");
			ws.send(
				JSON.stringify({
					request: "Subscribe",
					id: "subscribe-events-id",
					events: {
						general: ["Custom"],
					}
				})
			);

			ws.onmessage = async(event) => {
				// Parse our incoming data
				const wsdata = JSON.parse(event.data);
				if (wsdata.status == "ok" || wsdata.event.source == null) {
					return;
				}

				// Verify its a valid message
				if (wsdata.data == undefined) {
					console.log(wsdata);
					console.error("Invalid message received");
					return;
				}

				// Check for events to trigger
				switch (wsdata.data.name) {
					case ('AdRun'):
						AdRun(wsdata.data);
						break;
					case ('AdMidRoll'):
						AdMidRoll(wsdata.data);
						break;
				}
			};
		}
	}
}



///////////////////////
// TWITCH AD OVERLAY //
///////////////////////

function AdRun(data) {
	console.log(data);
	if (data.length <= 0)
	{
		TimerBarAnimation(singleAdLength);
		HugeTittiesAnimation(singleAdLength);
	}
	else
	{
		TimerBarAnimation(data.length);
		HugeTittiesAnimation(data.length);
	}
}

function AdMidRoll(data) {
	if (showMidRollCountdown != "Yes")
		return;

	//MidRollAnimation(data.length);
	MidRollAnimation(5);
}

function TimerBarAnimation(adLength) {
	let timerBar = document.getElementById("timerBar");

	// Set style
	timerBar.style.background = barColor;
	timerBar.style.position = "absolute";

	switch (barPosition) {
		case "None":
			timerBar.style.display = "none";
			break;
		case "Bottom":
			timerBar.style.height = lineThickness + "px";
			timerBar.style.bottom = "0px";
			timerBar.style.left = "0px";

			// Start Animation
			tl = new TimelineMax();
			tl
				.to(timerBar, 0.5, { width: window.innerWidth + "px", ease: Cubic.ease })
				.to(timerBar, adLength, { width: "0px", ease: Linear.easeNone })
			break;

		case "Top":
			timerBar.style.height = lineThickness + "px";
			timerBar.style.top = "0px";
			timerBar.style.left = "0px";

			// Start Animation
			tl = new TimelineMax();
			tl
				.to(timerBar, 0.5, { width: window.innerWidth + "px", ease: Cubic.ease })
				.to(timerBar, adLength, { width: "0px", ease: Linear.easeNone })
			break;

		case "Left":
			timerBar.style.width = lineThickness + "px";
			timerBar.style.bottom = "0px";
			timerBar.style.left = "0px";

			// Start Animation
			tl = new TimelineMax();
			tl
				.to(timerBar, 0.5, { height: window.innerHeight + "px", ease: Cubic.ease })
				.to(timerBar, adLength, { height: "0px", ease: Linear.easeNone })
			break;

		case "Right":
			timerBar.style.width = lineThickness + "px";
			timerBar.style.bottom = "0px";
			timerBar.style.right = "0px";

			// Start Animation
			tl = new TimelineMax();
			tl
				.to(timerBar, 0.5, { height: window.innerHeight + "px", ease: Cubic.ease })
				.to(timerBar, adLength, { height: "0px", ease: Linear.easeNone })
			break;
	}
}

function HugeTittiesAnimation(adLength) {

	let hugeTittiesContainer = document.getElementById("hugeTittiesContainer");

	switch (timerPosition) {
		case "None":
			hugeTittiesContainer.style.display = "none";
			break;
		case "Top Left":
			hugeTittiesContainer.style.top = "0px";
			hugeTittiesContainer.style.left = "0px";
			break;
		case "Top Right":
			hugeTittiesContainer.style.top = "0px";
			hugeTittiesContainer.style.right = "0px";
			break;
		case "Bottom Left":
			hugeTittiesContainer.style.bottom = "0px";
			hugeTittiesContainer.style.left = "0px";
			break;
		case "Bottom Right":
			hugeTittiesContainer.style.bottom = "0px";
			hugeTittiesContainer.style.right = "0px";
			break;
	}

	// Calculate starting time
	let startingTime = adLength % singleAdLength;
	if (startingTime == 0)
		startingTime = singleAdLength;

	// Estimate how many ads there should be
	let adsTotal = Math.ceil(adLength / singleAdLength);
	let adsRemaining = 1;

	// Start the countdown timer
	let adsRemainingContainer = document.getElementById("adsRemainingContainer");
	let timerContainer = document.getElementById("timerContainer");

	var timerThingy = setInterval(function () {
		startingTime--;
		if (startingTime == 0 && adsRemaining < adsTotal) {
			adsRemaining++;
			startingTime = singleAdLength;
		}
		if (startingTime == 0 && adsRemaining == adsTotal) {
			clearInterval(timerThingy);
			SetVisibility(false);
			return;
		}
		adsRemainingContainer.innerText = adsRemaining + " of " + adsTotal;
		timerContainer.innerText = startingTime.toString().toHHMMSS();

		// Show the widget
		SetVisibility(true);
	}, 1000)
}

function MidRollAnimation(countdownLength) {
	let midRollContainer = document.getElementById("midRollContainer");
	let midRollCountdownContainer = document.getElementById("midRollCountdownContainer");
	let width = midRollContainer.getBoundingClientRect().width;
	
	// Set the starting position of the countdown box
	midRollContainer.style.right = -width + "px";
	midRollCountdownContainer.innerHTML = countdownLength;

	// Slide the countdown box on screen
	ShowMidRollCountdown(true);

	// Start the countdown timer
	let startingTime = countdownLength;

	var timerThingy = setInterval(function () {
		startingTime--;
		midRollCountdownContainer.innerText = startingTime;
		if (startingTime == 0) {
			clearInterval(timerThingy);
			ShowMidRollCountdown(false);
			return;
		}
	}, 1000)
}

function SetVisibility(isVisible) {
	let hugeTittiesContainer = document.getElementById("hugeTittiesContainer");

	var tl = new TimelineMax();
	tl
		.to(hugeTittiesContainer, 0.5, { opacity: isVisible, ease: Linear.easeNone });
}

function ShowMidRollCountdown(isVisible) {
	let midRollContainer = document.getElementById("midRollContainer");
	let width = midRollContainer.getBoundingClientRect().width;

	var tl = new TimelineMax();

	if (isVisible)
	{
		tl
			.to(midRollContainer, 0.5, { right: "-10px", ease: Power1.easeInOut })
	}
	else
	{
		tl
			.to(midRollContainer, 0.5, { right: -width + "px", ease: Power1.easeInOut })
	}
}



//////////////////////
// HELPER FUNCTIONS //
//////////////////////

function sbDoAction(ws, actionName, data) {
	let request = JSON.stringify({
		request: "DoAction",
		id: "subscribe-do-action-id",
		action: {
			name: actionName
		},
		args: {
			data
		}
	});

	ws.send(request);
}

String.prototype.toHHMMSS = function () {
	var sec_num = parseInt(this, 10); // don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10) { hours = "0" + hours; }
	//if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) { seconds = "0" + seconds; }
	//return hours+':'+minutes+':'+seconds;
	return minutes + ':' + seconds;
}

function IsNullOrWhitespace(str) {
	return /^\s*$/.test(str);
}



///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

function SetConnectionStatus(connected) {
	let statusContainer = document.getElementById("statusContainer");
	if (connected) {
		statusContainer.style.background = "#2FB774";
		statusContainer.innerText = "Connected!";
		var tl = new TimelineMax();
		tl
			.to(statusContainer, 2, { opacity: 0, ease: Linear.easeNone })
		//.call(removeElement, [div]);
	}
	else {
		statusContainer.style.background = "#D12025";
		statusContainer.innerText = "Connecting...";
		statusContainer.style.opacity = 1;
	}
}



///////////////////////////
// STREAMELEMENTS EVENTS //
///////////////////////////

window.addEventListener('onWidgetLoad', function (obj) {
	const fieldData = obj.detail.fieldData;
	sbServerAddress = fieldData.sbServerAddress;
	sbServerPort = fieldData.sbServerPort;
	sbDebugMode = fieldData.sbDebugMode == "On" ? true : false;
	sbAdRun = fieldData.sbAdRun;
	sbAdMidRoll = fieldData.sbAdMidRoll;
	barColor = fieldData.barColor;
	lineThickness = fieldData.lineThickness;
	barPosition = fieldData.barPosition;
	timerPosition = fieldData.timerPosition;
	showMidRollCountdown = fieldData.showMidRollCountdown;
	testDuration = fieldData.testDuration;

	connectws();
});

window.addEventListener('onEventReceived', function (obj) {
	const listener = obj.detail.listener;
	// Handling widget buttons
	if (obj.detail.event) {
		if (obj.detail.event.listener === 'widget-button') {
			if (obj.detail.event.field === 'testButtonAdWidget') {
				const data = { length: testDuration };
				sbDoAction(ws, sbAdRun, data);
				AdRun(data);
			}
			if (obj.detail.event.field === 'testButtonAdMidRoll') {
				const data = { length: 5 };
				sbDoAction(ws, sbAdMidRoll, data);
				AdMidRoll(data);
			}
			return;
		}
	}
});

connectws();