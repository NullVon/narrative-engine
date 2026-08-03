"use strict";

/* --------------------------------------------------------------------------
   MAIN RENDER
-------------------------------------------------------------------------- */
function renderHeader() {
  const event = currentEvent();
  const location = event ? CAMPAIGN.locations[event.location].name : CAMPAIGN.locations.home.name;
  const focus = event?.focus ? characterName(event.focus) : "None";

  document.getElementById("header").innerHTML =
    `📅 ${formattedDate()} | ⏰ ${state.phase}<br>` +
    `📍 ${location} | 🎯 Focus: ${focus}`;

  document.getElementById("weatherTag").textContent = `Weather: ${state.weather || "—"}`;
  document.getElementById("metTag").textContent =
    `Met: ${state.met.filter(id => CAMPAIGN.characters[id]?.romanceable).length}/5`;

  document.getElementById("bondTag").textContent =
    event?.focus ? `Current bond: ${relationshipLabel(state.relationships[event.focus])}` : "Current bond: —";

  document.getElementById("saveTag").textContent =
    localStorage.getItem(SAVE_KEY) ? "Save available" : "No save yet";
}

function render() {
  renderHeader();
  updatePhone();

  const title = document.getElementById("title");
  const story = document.getElementById("story");
  const choices = document.getElementById("choices");
  const diceBox = document.getElementById("diceBox");
  const resultBox = document.getElementById("resultBox");

  choices.innerHTML = "";
  diceBox.style.display = "none";
  resultBox.style.display = "none";

  const freeActionBox = document.getElementById("freeActionBox");
  const freeActionButton = document.getElementById("freeActionButton");
  const freeActionInput = document.getElementById("freeActionInput");
  if (freeActionButton) freeActionButton.onclick = submitFreeAction;
  if (freeActionInput) {
    freeActionInput.onkeydown = event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitFreeAction();
      }
    };
  }
  if (freeActionBox) freeActionBox.style.display = state.currentResult || state.demoComplete || isResolutionBeat() ? "none" : "block";

  if (state.demoComplete) {
    title.textContent = "v1.2 Demo Complete";
    story.textContent =
      "You completed three simulated days.\n\n" +
      "Replay to see different Director selections, callbacks, relationship variants, and memory updates.\n\n" +
      "The important change is internal: campaign content is now data interpreted by generic engine systems.";
    const replay = document.createElement("button");
    replay.className = "primary center";
    replay.textContent = "Replay Three-Day Demo";
    replay.onclick = restartGame;
    choices.appendChild(replay);
    return;
  }

  const event = currentEvent();
  if (event && (!state.sceneBlueprint || state.sceneBlueprint.event.id !== event.id)) {
    buildSceneBlueprint(event);
  }
  if (event) ensureBeatScene(event);

  if (!event) {
    title.textContent = "Engine Error";
    story.textContent = "No event was selected.";
    return;
  }

  const beat = currentBeat();
  title.textContent = beat?.title || event.title;
  story.textContent = beat?.text || resolveEventText(event);

  const beatBox = document.getElementById("beatBox");
  if (beatBox) beatBox.style.display = "block";
  const beatCounter = document.getElementById("beatCounter");
  const momentumTag = document.getElementById("momentumTag");
  const beatTitle = document.getElementById("beatTitle");
  const beatText = document.getElementById("beatText");
  if (beatCounter) beatCounter.textContent = `Beat ${state.beatState.index + 1} / ${state.beatState.beats.length}`;
  if (momentumTag) momentumTag.textContent = `Momentum: ${state.beatState.momentum}`;
  if (beatTitle) beatTitle.textContent = beat?.title || "";
  if (beatText) beatText.textContent = beat?.kind === "opening" ? "Opening beat" : beat?.text || "";

  if (state.currentResult) {
    resultBox.style.display = "block";
    document.getElementById("resultTitle").textContent = state.currentResult.title;
    document.getElementById("resultText").textContent = state.currentResult.text;
    document.getElementById("continueButton").onclick = advanceBeat;
    return;
  }

  if (isOpeningBeat()) {
    event.choices.forEach(choice => {
      const button = document.createElement("button");
      button.textContent = choice.label;
      button.onclick = () => chooseOption(choice);
      choices.appendChild(button);
    });
  } else {
    renderBeatChoices(choices);
  }
}

function initializeGame() {
  updateSeasonAndTerm();
  seedCommitmentsIfNeeded();
  refreshCommitmentStatuses();
  chooseWeather();
  rollDailyMoods();
  selectEventForCurrentPhase();
  render();
}

initializeGame();
