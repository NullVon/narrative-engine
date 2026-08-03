"use strict";

/* --------------------------------------------------------------------------
   DIRECTOR
-------------------------------------------------------------------------- */
function adjustedWeight(event) {
  let weight = event.baseWeight || 1;

  if (event.once && state.eventHistory.includes(event.id)) return 0;

  const lastSamePhase = state.recentEvents
    .slice()
    .reverse()
    .find(entry => entry.phase === state.phase);

  if (lastSamePhase && lastSamePhase.eventId === event.id) return 0;

  const cooldownDays = event.cooldownDays ?? 1;
  const previousRuns = state.recentEvents.filter(entry => entry.eventId === event.id);
  if (previousRuns.length) {
    const lastRun = previousRuns[previousRuns.length - 1];
    if (state.day - lastRun.day <= cooldownDays) return 0;
  }

  const recentCharacters = state.recentFocus.slice(-2);
  if (recentCharacters.includes(event.focus)) weight *= 0.25;

  if (event.focus && !hasMet(event.focus)) weight *= 1.35;

  const bond = state.relationships[event.focus] || 0;
  if (bond >= 4) weight *= 1.18;
  if (bond >= 8) weight *= 1.12;

  weight *= moodWeightModifier(event.focus);
  weight *= socialGroupBonus(event);

  const relevant = topRelevantMemory(event.focus, event);
  if (relevant) weight *= 1 + Math.min(0.35, relevant.score / 40);

  // NPC initiative: comfortable characters are more likely to seek the player out.
  if (bond >= 6 && hasMet(event.focus)) weight *= 1.22;

  return Math.max(1, Math.round(weight));
}

function weightedPick(events) {
  const total = events.reduce((sum, event) => sum + event.weight, 0);
  let cursor = Math.random() * total;
  for (const event of events) {
    cursor -= event.weight;
    if (cursor <= 0) return event;
  }
  return events[0];
}

function selectEventForCurrentPhase() {
  state.directorLog = [];
  const phaseEvents = CAMPAIGN.events.filter(event => event.phase === state.phase);
  const eligible = [];

  phaseEvents.forEach(event => {
    const passed = requirementsPass(event.requirements || []);
    const weight = passed ? adjustedWeight(event) : 0;
    const rules = (event.requirements || []).map(requirementExplanation);

    if (passed && event.focus) {
      rules.push(`Mood: ${state.moods?.[event.focus] || "neutral"}`);
      const relevant = topRelevantMemory(event.focus, event);
      if (relevant) {
        rules.push(`Memory influence: ${relevant.memory.id} (${relevant.score})`);
      }
      if ((state.relationships[event.focus] || 0) >= 6) {
        rules.push("NPC initiative bonus applied.");
      }
      if (event.groupParticipants?.length >= 2) {
        const pairs = [];
        for (let i = 0; i < event.groupParticipants.length; i++) {
          for (let j = i + 1; j < event.groupParticipants.length; j++) {
            const a = event.groupParticipants[i], b = event.groupParticipants[j];
            pairs.push(`${characterName(a)}↔${characterName(b)}: ${npcRelation(a,b)}`);
          }
        }
        rules.push(`Group social state: ${pairs.join(", ")}`);
      }
    }

    if (passed && weight === 0) {
      rules.push("✗ Repeat protection or cooldown blocked this event.");
    }

    state.directorLog.push({
      eventId: event.id,
      status: passed && weight > 0 ? "eligible" : "blocked",
      weight,
      rules
    });

    if (passed && weight > 0) eligible.push({ ...event, weight });
  });

  if (!eligible.length) {
    throw new Error(`No eligible events for ${state.phase} on Day ${state.day}.`);
  }

  const selected = weightedPick(eligible);
  state.directorLog.push({
    eventId: selected.id,
    status: "selected",
    weight: selected.weight,
    rules: [`Director selected ${selected.id}.`]
  });

  state.currentEventId = selected.id;
  state.eventHistory.push(selected.id);
  buildSceneBlueprint(selected);

  const selectedMemory = selected.focus ? topRelevantMemory(selected.focus, selected) : null;
  if (selectedMemory) {
    selectedMemory.memory.timesReferenced += 1;
    selectedMemory.memory.lastReferencedDay = state.day;
    selectedMemory.memory.importance = Math.min(10, selectedMemory.memory.importance + 0.5);
  }
  state.recentEvents.push({
    eventId: selected.id,
    day: state.day,
    phase: state.phase,
    focus: selected.focus || null
  });
  if (state.recentEvents.length > 20) state.recentEvents.shift();

  if (selected.focus) {
    state.recentFocus.push(selected.focus);
    if (state.recentFocus.length > 5) state.recentFocus.shift();
    if (!hasMet(selected.focus)) state.met.push(selected.focus);
  }
}

function currentEvent() {
  return CAMPAIGN.events.find(event => event.id === state.currentEventId);
}

function resolveEventText(event) {
  const variants = event.variants || [];
  let baseText = event.text;

  for (const variant of variants) {
    if (requirementsPass(variant.requirements || [])) {
      baseText = variant.text;
      break;
    }
  }

  const relevant = event.focus ? topRelevantMemory(event.focus, event) : null;
  if (!relevant || state.day <= relevant.memory.dayCreated) return baseText;

  const mood = state.moods?.[event.focus] || "neutral";
  const callback = {
    calm: `The memory of "${relevant.memory.title}" seems to have softened the distance between you.`,
    cheerful: `${characterName(event.focus)} appears noticeably brighter when the memory of "${relevant.memory.title}" comes up.`,
    embarrassed: `${characterName(event.focus)} avoids directly mentioning "${relevant.memory.title}", which makes it more obvious that it is still on their mind.`,
    guarded: `${characterName(event.focus)} remembers "${relevant.memory.title}", but keeps the reaction carefully controlled.`,
    tired: `Even tired, ${characterName(event.focus)} seems to recognize the familiar thread connecting this moment to "${relevant.memory.title}".`,
    irritated: `${characterName(event.focus)} has not forgotten "${relevant.memory.title}", though the memory is tangled with today's irritation.`,
    neutral: `The memory of "${relevant.memory.title}" still lingers between you.`
  }[mood] || `The memory of "${relevant.memory.title}" still lingers between you.`;

  return `${callback}

${baseText}`;
}
