"use strict";

/* --------------------------------------------------------------------------
   SAVE / LOAD
-------------------------------------------------------------------------- */
function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  playBeep(660, 100);
  updatePhone();
  renderHeader();
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    alert("No save found.");
    return;
  }

  try {
    state = JSON.parse(raw);
    state.recentEvents = Array.isArray(state.recentEvents) ? state.recentEvents : [];
    state.recentFocus = Array.isArray(state.recentFocus) ? state.recentFocus : [];
    state.eventHistory = Array.isArray(state.eventHistory) ? state.eventHistory : [];
    state.moods = state.moods || Object.fromEntries(Object.keys(CAMPAIGN.characters).map(id => [id, "neutral"]));
    state.npcRelations = state.npcRelations || Object.fromEntries(
      Object.keys(CAMPAIGN.characters).map(a => [
        a,
        Object.fromEntries(Object.keys(CAMPAIGN.characters).filter(b => b !== a).map(b => [b, 0]))
      ])
    );
    state.rumors = Array.isArray(state.rumors) ? state.rumors : [];
    state.offscreenEvents = Array.isArray(state.offscreenEvents) ? state.offscreenEvents : [];
    state.calendar = state.calendar || {year:2026,month:4,dayOfMonth:6,weekdayIndex:0,season:"Spring",schoolTerm:"Spring Term"};
    state.commitments = Array.isArray(state.commitments) ? state.commitments : [];
    state.commitmentHistory = Array.isArray(state.commitmentHistory) ? state.commitmentHistory : [];
    state.nextCommitmentId = state.nextCommitmentId || 1;
    state.sceneBlueprint = state.sceneBlueprint || null;
    state.blueprintHistory = Array.isArray(state.blueprintHistory) ? state.blueprintHistory : [];
    state.intentHistory = Array.isArray(state.intentHistory) ? state.intentHistory : [];
    state.beatState = state.beatState || {eventId:null,index:0,momentum:20,beats:[],extended:false,actionCount:0};
    state.beatHistory = Array.isArray(state.beatHistory) ? state.beatHistory : [];
    seedCommitmentsIfNeeded();
    refreshCommitmentStatuses();
    pendingRollChoice = null;
    if (state.currentEventId) buildSceneBlueprint(currentEvent());
    render();
    updatePhone();
  } catch (_) {
    alert("The save could not be read.");
  }
}

function restartGame() {
  if (confirm("Restart the three-day demo?")) {
    state = freshState();
    pendingRollChoice = null;
    initializeGame();
  }
}

function toggleSound() {
  state.sound = !state.sound;
  alert(state.sound ? "Sound on" : "Sound off");
}
