"use strict";

/* --------------------------------------------------------------------------
   BEAT ENGINE
   One phase contains a scene made of multiple beats. A player choice or free
   action resolves the current beat; only the resolution beat advances time.
-------------------------------------------------------------------------- */
const BEAT_LIBRARY = {
  reaction: [
    { title: "Immediate Reaction", text: "Your response changes the atmosphere. The focus character has a moment to react before anything else happens.", momentum: 7 },
    { title: "A Response Forms", text: "The first reaction is small, but it alters the direction of the conversation.", momentum: 6 }
  ],
  callback: [
    { title: "A Familiar Thread", text: "An earlier shared memory quietly influences the present moment.", momentum: 7 }
  ],
  complication: [
    { title: "A Small Complication", text: "Before the moment settles, another detail changes what everyone expects.", momentum: 9 },
    { title: "Someone Notices", text: "The interaction draws attention, creating a second layer of social pressure.", momentum: 8 }
  ],
  extension: [
    { title: "The Moment Continues", text: "There is enough momentum for the interaction to continue rather than ending immediately.", momentum: 5 }
  ],
  resolution: [
    { title: "The World Moves On", text: "A bell, an obligation, or the natural end of the conversation brings the scene to a close.", momentum: -25 }
  ]
};

function randomBeat(kind) {
  const pool = BEAT_LIBRARY[kind];
  return { ...pool[Math.floor(Math.random() * pool.length)], kind };
}

function buildBeatSequence(event) {
  const beats = [{
    kind: "opening",
    title: event.title,
    text: resolveEventText(event),
    momentum: 8,
    interactive: true
  }];

  beats.push(randomBeat("reaction"));

  if (state.sceneBlueprint?.memories?.length) {
    const beat = randomBeat("callback");
    beat.text = `The memory of "${state.sceneBlueprint.memories[0].title}" shapes the next exchange.`;
    beats.push(beat);
  } else {
    beats.push(randomBeat("complication"));
  }

  if (state.sceneBlueprint?.conflicts?.length || event.groupParticipants?.length) {
    beats.push(randomBeat("complication"));
  }

  beats.push(randomBeat("resolution"));
  return beats;
}

function ensureBeatScene(event) {
  if (!event) return;
  if (state.beatState?.eventId === event.id && state.beatState.beats?.length) return;

  state.beatState = {
    eventId: event.id,
    index: 0,
    momentum: 20,
    beats: buildBeatSequence(event),
    extended: false,
    actionCount: 0
  };
}

function currentBeat() {
  return state.beatState?.beats?.[state.beatState.index] || null;
}

function isOpeningBeat() {
  return currentBeat()?.kind === "opening";
}

function isResolutionBeat() {
  return currentBeat()?.kind === "resolution";
}

function adjustSceneMomentum(amount) {
  state.beatState.momentum = Math.max(0, Math.min(100, state.beatState.momentum + amount));
}

function recordBeatAction(label, momentumDelta = 4) {
  state.beatState.actionCount += 1;
  adjustSceneMomentum(momentumDelta);
  state.beatHistory.push({
    day: state.day,
    phase: state.phase,
    eventId: state.currentEventId,
    beatIndex: state.beatState.index,
    label,
    momentum: state.beatState.momentum
  });
  if (state.beatHistory.length > 60) state.beatHistory.shift();
}

function maybeExtendScene() {
  if (state.beatState.extended || state.beatState.momentum < 42) return;
  const resolutionIndex = state.beatState.beats.findIndex(beat => beat.kind === "resolution");
  if (resolutionIndex > state.beatState.index) {
    state.beatState.beats.splice(resolutionIndex, 0, randomBeat("extension"));
    state.beatState.extended = true;
  }
}

function advanceBeat() {
  state.currentResult = null;
  maybeExtendScene();

  if (state.beatState.index < state.beatState.beats.length - 1) {
    state.beatState.index += 1;
    const beat = currentBeat();
    adjustSceneMomentum(beat?.momentum || 0);
    render();
    return;
  }

  finishBeatScene();
}

function finishBeatScene() {
  state.beatState = { eventId:null, index:0, momentum:20, beats:[], extended:false, actionCount:0 };
  continueAfterResult();
}

function genericBeatChoices() {
  return [
    { label:"Respond directly", result:"You answer directly, keeping the interaction active.", momentum:7, intent:"talk" },
    { label:"Observe their reaction", result:"You pause and pay attention to the smaller details in their response.", momentum:3, intent:"observe" },
    { label:"Ease toward a conclusion", result:"You let the conversation settle instead of forcing it further.", momentum:-8, intent:"leave" }
  ];
}

function chooseBeatOption(option) {
  recordBeatAction(option.intent, option.momentum);
  state.currentResult = { title:"Beat Resolved", text:option.result };
  render();
}

function renderBeatChoices(container) {
  if (isResolutionBeat()) {
    const button = document.createElement("button");
    button.className = "primary center";
    button.textContent = "Let the scene end";
    button.onclick = finishBeatScene;
    container.appendChild(button);
    return;
  }

  genericBeatChoices().forEach(option => {
    const button = document.createElement("button");
    button.textContent = option.label;
    button.onclick = () => chooseBeatOption(option);
    container.appendChild(button);
  });
}

function updateBeatFlow() {
  const list = document.getElementById("beatFlowList");
  if (!list) return;
  if (!state.beatState?.beats?.length) {
    list.innerHTML = '<div class="small">No active scene flow.</div>';
    return;
  }

  list.innerHTML = state.beatState.beats.map((beat, index) => `
    <div class="card ${index === state.beatState.index ? "selected" : ""}">
      <strong>${index + 1}. ${beat.title}</strong><br>
      Type: ${beat.kind}<br>
      Momentum effect: ${beat.momentum >= 0 ? "+" : ""}${beat.momentum}<br>
      ${index === state.beatState.index ? "Current beat" : index < state.beatState.index ? "Completed" : "Upcoming"}
    </div>
  `).join("");
}
