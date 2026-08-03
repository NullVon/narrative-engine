"use strict";

/* --------------------------------------------------------------------------
   GENERIC ENGINE STATE
-------------------------------------------------------------------------- */
function freshState() {
  const relationships = {};
  const emotions = {};
  Object.keys(CAMPAIGN.characters).forEach(id => {
    relationships[id] = 0;
    emotions[id] = { curiosity: 0, trust: 0, embarrassment: 0, jealousy: 0, joy: 0 };
  });

  return {
    campaignId: CAMPAIGN.meta.id,
    engineVersion: CAMPAIGN.meta.version,
    day: 1,
    phaseIndex: 0,
    phase: CAMPAIGN.phases[0],
    weather: null,
    currentEventId: null,
    currentResult: null,
    relationships,
    emotions,
    moods: Object.fromEntries(Object.keys(CAMPAIGN.characters).map(id => [id, "neutral"])),
    npcRelations: Object.fromEntries(
      Object.keys(CAMPAIGN.characters).map(a => [
        a,
        Object.fromEntries(Object.keys(CAMPAIGN.characters).filter(b => b !== a).map(b => [b, 0]))
      ])
    ),
    rumors: [],
    offscreenEvents: [],
    calendar: {year:2026,month:4,dayOfMonth:6,weekdayIndex:0,season:"Spring",schoolTerm:"Spring Term"},
    commitments: [],
    commitmentHistory: [],
    nextCommitmentId: 1,
    sceneBlueprint: null,
    blueprintHistory: [],
    intentHistory: [],
    beatState: {
      eventId: null,
      index: 0,
      momentum: 20,
      beats: [],
      extended: false,
      actionCount: 0
    },
    beatHistory: [],
    reputation: 0,
    met: ["reina"],
    memories: [],
    messages: [],
    recentFocus: [],
    recentEvents: [],
    eventHistory: [],
    directorLog: [],
    sound: true,
    demoComplete: false
  };
}

let state = freshState();
