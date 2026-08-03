"use strict";

/* --------------------------------------------------------------------------
   EFFECT AND MEMORY ENGINE
-------------------------------------------------------------------------- */
function addMemory(template) {
  const existing = state.memories.find(memory => memory.id === template.id);

  if (existing) {
    existing.timesReferenced += 1;
    existing.importance = Math.min(10, existing.importance + 1);
    existing.lastReferencedDay = state.day;
    existing.summary = template.summary || existing.summary;
    existing.emotion = template.emotion || existing.emotion;
    return;
  }

  state.memories.push({
    ...template,
    dayCreated: state.day,
    phaseCreated: state.phase,
    timesReferenced: 1,
    lastReferencedDay: state.day
  });
}

function applyEffect(effect) {
  switch (effect.type) {
    case "relationship":
      state.relationships[effect.character] =
        (state.relationships[effect.character] || 0) + effect.amount;
      break;

    case "emotion":
      state.emotions[effect.character][effect.key] =
        (state.emotions[effect.character][effect.key] || 0) + effect.amount;
      break;

    case "reputation":
      state.reputation += effect.amount;
      break;

    case "meet":
      if (!hasMet(effect.character)) state.met.push(effect.character);
      break;

    case "memory":
      addMemory(effect.memory);
      break;

    case "message":
      state.messages.push({
        from: effect.from,
        text: effect.text,
        day: state.day,
        phase: state.phase
      });
      break;
  }
}

function applyEffects(effects = []) {
  effects.forEach(applyEffect);
}

function chooseOption(choice) {
  playBeep(430, 45);
  if (state.beatState?.eventId) recordBeatAction("scripted_choice", choice.roll ? 8 : 6);

  if (choice.roll) {
    showDiceForChoice(choice);
    return;
  }

  applyEffects(choice.effects || []);
  state.currentResult = {
    title: "Outcome",
    text: choice.result
  };
  render();
}
