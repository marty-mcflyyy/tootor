var musicalKeysInfo, trumpetValvesInfo;

fetch("./data/keys.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    musicalKeysInfo = data;
  });

fetch("./data/valves.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    trumpetValvesInfo = data;
  });

var currentNote = "C5";
var currentKey = "c-major";
var currentNoteIndex = 3;

function getRandomNoteIndex(key) {
  const randomIndex = Math.floor(
    Math.random() * (musicalKeysInfo[key].notes.length - 1),
  );
  if (randomIndex >= currentNoteIndex) {
    return randomIndex + 1;
  }
  return randomIndex;
}

const heldValves = new Set();

function keyboardInputToValve(keyboardInput) {
  if (keyboardInput === "j" || keyboardInput === "1") {
    return "1";
  }
  if (keyboardInput === "k" || keyboardInput === "2") {
    return "2";
  }
  if (keyboardInput === "l" || keyboardInput === "3") {
    return "3";
  }
  return "";
}

function moveValve(valve, direction) {
  var newYPos = direction === "down" ? 18.25 : 17;
  for (var element of document.getElementsByClassName(`valve-${valve} top`)) {
    element.setAttribute("y", newYPos.toString());
    element.setAttribute("cy", (newYPos + 0.25).toString());
  }

  for (var element of document.getElementsByClassName(`valve-${valve} stem`)) {
    element.setAttribute("y", (newYPos + 0.5).toString());
    element.setAttribute("height", direction === "down" ? "0.5" : "1.5");
  }
}

// Key down handler
document.addEventListener("keydown", (e) => {
  // Prevents multiple presses for button hold
  if (e.repeat) {
    return;
  }

  // Track finger keys
  var valve = keyboardInputToValve(e.key);
  moveValve(valve, "down");
  heldValves.add(valve);

  // Enter key pressed
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();

    handleEnter();
  }
});

// Key up handler
document.addEventListener("keyup", (e) => {
  // Track finger keys
  var valve = keyboardInputToValve(e.key);
  moveValve(valve, "up");
  heldValves.delete(valve);
});

function changeNotePosition(noteIndex) {
  const note = document.getElementById("note");

  var noteString = musicalKeysInfo[currentKey].notes[noteIndex]
    .replace("#", "")
    .replace("b", "");

  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  var notePosition =
    106 - (notes.indexOf(noteString[0]) + parseInt(noteString[1]) * 7) * 2;

  // Check what extra bars need to be rendered

  for (let element of document.getElementsByClassName("extra-bar")) {
    var yPos = parseFloat(element.getAttribute("y"));

    if (yPos >= 35.75) {
      // Bottom bar
      if (yPos + 0.25 > notePosition) {
        element.setAttribute("x", "40");
        element.setAttribute("width", "0");
      } else {
        element.setAttribute("x", "36");
        element.setAttribute("width", "8");
      }
    } else {
      // Top bar
      if (yPos + 0.25 < notePosition) {
        element.setAttribute("x", "40");
        element.setAttribute("width", "0");
      } else {
        element.setAttribute("x", "36");
        element.setAttribute("width", "8");
      }
    }
  }

  note.setAttribute("cy", notePosition.toString());
}

var radioOptions = document.getElementsByClassName("key-picker-option");

for (var radioOption of radioOptions) {
  radioOption.onchange = function () {
    console.log(this.value);
    currentKey = this.value;
    var keyInfo = musicalKeysInfo[this.value];

    for (var i = 1; i <= 7; i++) {
      if (i <= keyInfo.num_sharps) {
        document.getElementById(`sharp-${i}`).style.display = "block";
      } else {
        document.getElementById(`sharp-${i}`).style.display = "none";
      }

      if (i <= keyInfo.num_flats) {
        document.getElementById(`flat-${i}`).style.display = "block";
      } else {
        document.getElementById(`flat-${i}`).style.display = "none";
      }
    }
  };
}

function getCorrectValves() {
  var correctValves = "";
  for (var noteValves of trumpetValvesInfo) {
    if (currentNote === noteValves.note) {
      correctValves = noteValves.valves;
      break;
    }
  }
  return correctValves;
}

function valvesAreCorrect() {
  const valves = [...heldValves].sort().join("") || "0";

  return valves === getCorrectValves();
}

function handleEnter() {
  if (valvesAreCorrect()) {
    currentNoteIndex = getRandomNoteIndex(currentKey);
    currentNote = musicalKeysInfo[currentKey].notes[currentNoteIndex];

    changeNotePosition(currentNoteIndex);
  } else {
    const note = document.getElementById("note");
    void note.offsetWidth; // this force-restarts the CSS animation
    note.classList.add("wiggle");
    note.addEventListener(
      "animationend",
      () => {
        note.classList.remove("wiggle");
      },
      { once: true },
    );

    for (const valve of getCorrectValves()) {
      if (valve === "0") {
        continue;
      }
      const valveElement = document.getElementById(`valve-${valve}-indicator`);

      void valveElement.offsetWidth; // this force-restarts the CSS animation
      valveElement.classList.add("show");
      valveElement.addEventListener(
        "animationend",
        () => {
          valveElement.classList.remove("show");
        },
        { once: true },
      );
    }
  }
}
