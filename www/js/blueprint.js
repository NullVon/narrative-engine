"use strict";

/* --------------------------------------------------------------------------
   SCENE BLUEPRINT ENGINE
-------------------------------------------------------------------------- */
function activeCommitmentConflictsForCurrentPhase() {
  const c = state.calendar;
  const today = commitmentsForDate(c.year, c.month, c.dayOfMonth)
    .filter(x => x.status === "accepted" && x.slot === state.phase);

  const conflicts = [];
  for (let i = 0; i < today.length; i++) {
    for (let j = i + 1; j < today.length; j++) {
      conflicts.push({
        type: "commitment_conflict",
        commitments: [today[i].title, today[j].title],
        severity:
          today[i].importance === "critical" || today[j].importance === "critical"
            ? "high"
            : "medium"
      });
    }
  }
  return conflicts;
}

function availableCharactersForPhase(phase) {
  return Object.entries(CAMPAIGN.characters)
    .filter(([, character]) => Array.isArray(character.schedule?.[phase]) && character.schedule[phase].length)
    .map(([id]) => id);
}

function buildSceneBlueprint(event) {
  if (!event) return null;

  const focus = event.focus || null;
  const relevantMemory = focus ? topRelevantMemory(focus, event) : null;
  const currentCommitments = commitmentsForDate(
    state.calendar.year,
    state.calendar.month,
    state.calendar.dayOfMonth
  ).filter(c => ["accepted", "pending"].includes(c.status));

  const conflicts = [
    ...activeCommitmentConflictsForCurrentPhase()
  ];

  if (event.groupParticipants?.length >= 2) {
    const socialPairs = [];
    for (let i = 0; i < event.groupParticipants.length; i++) {
      for (let j = i + 1; j < event.groupParticipants.length; j++) {
        const a = event.groupParticipants[i];
        const b = event.groupParticipants[j];
        socialPairs.push({
          characters: [a, b],
          relation: npcRelation(a, b)
        });
      }
    }
    conflicts.push({
      type: "group_social_state",
      pairs: socialPairs
    });
  }

  const blueprint = {
    generatedAt: {
      day: state.day,
      date: formattedDate(),
      phase: state.phase
    },
    event: {
      id: event.id,
      title: event.title,
      phase: event.phase,
      locationId: event.location,
      locationName: CAMPAIGN.locations[event.location]?.name || event.location,
      baseWeight: event.baseWeight || 1
    },
    world: {
      weather: state.weather,
      season: state.calendar.season,
      schoolTerm: state.calendar.schoolTerm,
      weekday: WEEKDAYS[state.calendar.weekdayIndex]
    },
    cast: {
      focus,
      focusName: focus ? characterName(focus) : null,
      groupParticipants: event.groupParticipants || [],
      availableCharacters: availableCharactersForPhase(state.phase)
    },
    relationship: focus ? {
      value: state.relationships[focus] || 0,
      label: relationshipLabel(state.relationships[focus] || 0),
      mood: state.moods?.[focus] || "neutral",
      emotionalTilt: dominantEmotion(focus)
    } : null,
    memories: relevantMemory ? [{
      id: relevantMemory.memory.id,
      title: relevantMemory.memory.title,
      relevance: relevantMemory.score,
      emotion: relevantMemory.memory.emotion,
      importance: relevantMemory.memory.importance
    }] : [],
    commitments: currentCommitments.map(c => ({
      id: c.id,
      title: c.title,
      organizer: c.organizer,
      organizerName: c.organizer ? characterName(c.organizer) : null,
      slot: c.slot,
      importance: c.importance,
      status: c.status
    })),
    conflicts,
    possibleIntents: [
      "talk",
      "help",
      "ask",
      "tease",
      "flirt",
      "apologize",
      "comfort",
      "investigate",
      "leave"
    ],
    selection: {
      directorLog: state.directorLog.slice(),
      recentFocus: state.recentFocus.slice(),
      recentEvents: state.recentEvents.slice(-5)
    }
  };

  state.sceneBlueprint = blueprint;
  state.blueprintHistory.push(blueprint);
  if (state.blueprintHistory.length > 20) state.blueprintHistory.shift();
  return blueprint;
}

function blueprintSummary(blueprint) {
  if (!blueprint) return "No blueprint generated.";

  const memory = blueprint.memories[0];
  const conflictText = blueprint.conflicts.length
    ? blueprint.conflicts.map(c => c.type).join(", ")
    : "None";

  return [
    `Event: ${blueprint.event.title}`,
    `Date: ${blueprint.generatedAt.date}`,
    `Phase: ${blueprint.generatedAt.phase}`,
    `Location: ${blueprint.event.locationName}`,
    `Focus: ${blueprint.cast.focusName || "None"}`,
    `Relationship: ${blueprint.relationship?.label || "—"}`,
    `Mood: ${blueprint.relationship?.mood || "—"}`,
    `Relevant memory: ${memory ? `${memory.title} (${memory.relevance})` : "None"}`,
    `Conflicts: ${conflictText}`,
    `Commitments: ${blueprint.commitments.length}`
  ].join("\n");
}
