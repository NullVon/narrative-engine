"use strict";

/* --------------------------------------------------------------------------
   TIME
-------------------------------------------------------------------------- */
function continueAfterResult() {
  state.currentResult = null;
  simulateOffscreenSocialWorld();

  if (state.phaseIndex < CAMPAIGN.phases.length - 1) {
    state.phaseIndex += 1;
  } else {
    state.day += 1;
    state.phaseIndex = 0;
    state.weather = null;
    advanceCalendarDay();
    decayEmotions();
    rollDailyMoods();
  }

  if (state.day > CAMPAIGN.meta.maxDemoDays) {
    state.demoComplete = true;
    state.currentEventId = null;
    render();
    return;
  }

  state.phase = CAMPAIGN.phases[state.phaseIndex];
  chooseWeather();
  selectEventForCurrentPhase();
  render();
}

function decayEmotions() {
  Object.values(state.emotions).forEach(emotionMap => {
    Object.keys(emotionMap).forEach(key => {
      emotionMap[key] = Math.max(0, emotionMap[key] - 1);
    });
  });
}
