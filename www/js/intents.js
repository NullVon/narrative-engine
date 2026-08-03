"use strict";

/* --------------------------------------------------------------------------
   FREE ACTION / INTENT ENGINE
-------------------------------------------------------------------------- */
const INTENT_PATTERNS = [
  { intent: "apologize", words: ["apologize","sorry","forgive me","my fault"] },
  { intent: "help", words: ["help","assist","carry","take half","lend a hand","support"] },
  { intent: "tease", words: ["tease","joke","kid","mess with","poke fun"] },
  { intent: "flirt", words: ["flirt","romantic","cute","beautiful","pretty","date"] },
  { intent: "comfort", words: ["comfort","reassure","hug","it's okay","calm down"] },
  { intent: "ask", words: ["ask","question","why","what","how","tell me"] },
  { intent: "investigate", words: ["investigate","inspect","search","look into","examine"] },
  { intent: "give", words: ["give","offer","hand","present"] },
  { intent: "refuse", words: ["refuse","decline","no","won't","will not"] },
  { intent: "leave", words: ["leave","walk away","go home","exit"] },
  { intent: "study", words: ["study","review","practice","homework"] },
  { intent: "invite", words: ["invite","come with me","join me","go together"] },
  { intent: "observe", words: ["observe","watch","listen","stay quiet"] },
  { intent: "talk", words: ["talk","chat","speak","say"] }
];

const TONE_PATTERNS = [
  { tone:"sincere", words:["sincerely","honestly","genuinely","seriously"] },
  { tone:"playful", words:["joking","playfully","teasingly","with a grin"] },
  { tone:"quiet", words:["quietly","softly","gently"] },
  { tone:"bold", words:["boldly","confidently","without hesitation"] },
  { tone:"awkward", words:["awkwardly","nervously","hesitantly"] },
  { tone:"formal", words:["formally","politely","respectfully"] }
];

function extractTarget(text, blueprint) {
  const lower = text.toLowerCase();

  for (const [id, character] of Object.entries(CAMPAIGN.characters)) {
    const firstName = character.name.split(" ")[0].toLowerCase();
    const lastName = character.name.split(" ").slice(-1)[0].toLowerCase();
    const nickname = (character.nickname || "").toLowerCase();

    if (lower.includes(firstName) || lower.includes(lastName) || (nickname && lower.includes(nickname))) {
      return id;
    }
  }

  return blueprint?.cast?.focus || null;
}

function extractObject(text) {
  const lower = text.toLowerCase();
  const objects = [
    "papers","paperwork","book","books","umbrella","lunch","pastries",
    "festival","notes","bag","folders","homework","phone","message","chair"
  ];

  return objects.find(object => lower.includes(object)) || null;
}

function parseIntent(text, blueprint) {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const matches = INTENT_PATTERNS
    .map(pattern => ({
      intent: pattern.intent,
      score: pattern.words.reduce((score, word) => score + (lower.includes(word) ? 1 : 0), 0)
    }))
    .filter(match => match.score > 0)
    .sort((a,b) => b.score - a.score);

  const primary = matches[0]?.intent || "talk";
  const secondary = matches[1]?.intent || null;

  const toneMatch = TONE_PATTERNS.find(pattern =>
    pattern.words.some(word => lower.includes(word))
  );

  return {
    rawText: clean,
    primaryIntent: primary,
    secondaryIntent: secondary,
    target: extractTarget(clean, blueprint),
    targetName: extractTarget(clean, blueprint) ? characterName(extractTarget(clean, blueprint)) : null,
    tone: toneMatch?.tone || "neutral",
    object: extractObject(clean),
    confidence: matches.length ? Math.min(0.95, 0.55 + matches[0].score * 0.15) : 0.45
  };
}

function relationshipDeltaForIntent(intent, tone) {
  const base = {
    help: 2,
    apologize: 2,
    comfort: 2,
    flirt: 1,
    tease: 1,
    ask: 1,
    invite: 1,
    give: 1,
    observe: 0,
    investigate: 0,
    study: 1,
    talk: 0,
    refuse: -1,
    leave: -1
  }[intent] ?? 0;

  const toneBonus = {
    sincere: 1,
    quiet: 0.5,
    formal: 0.5,
    playful: 0,
    bold: 0,
    awkward: 0,
    neutral: 0
  }[tone] ?? 0;

  return base + toneBonus;
}

function emotionalEffectForIntent(intent, tone) {
  if (intent === "apologize") return { key:"trust", amount:2 };
  if (intent === "help") return { key:"trust", amount:1 };
  if (intent === "comfort") return { key:"trust", amount:2 };
  if (intent === "flirt") return { key:"embarrassment", amount:2 };
  if (intent === "tease") return { key:"embarrassment", amount:tone === "playful" ? 1 : 2 };
  if (intent === "refuse" || intent === "leave") return { key:"jealousy", amount:1 };
  if (intent === "ask") return { key:"curiosity", amount:1 };
  return null;
}

function freeActionNarration(parsed, blueprint) {
  const target = parsed.targetName || "the room";
  const objectText = parsed.object ? ` involving the ${parsed.object}` : "";
  const toneText = parsed.tone !== "neutral" ? ` in a ${parsed.tone} way` : "";

  const templates = {
    help: `You step in to help ${target}${objectText}${toneText}.`,
    apologize: `You apologize to ${target}${toneText}.`,
    tease: `You tease ${target}${objectText}${toneText}.`,
    flirt: `You direct a flirtatious remark toward ${target}${toneText}.`,
    comfort: `You try to comfort ${target}${toneText}.`,
    ask: `You ask ${target} about ${parsed.object || "the situation"}${toneText}.`,
    investigate: `You investigate ${parsed.object || "the scene"}${toneText}.`,
    give: `You offer ${parsed.object || "something"} to ${target}${toneText}.`,
    refuse: `You refuse ${target}${toneText}.`,
    leave: `You decide to leave${toneText}.`,
    invite: `You invite ${target} to join you${toneText}.`,
    study: `You focus on studying${objectText}${toneText}.`,
    observe: `You stay quiet and observe${toneText}.`,
    talk: `You speak with ${target}${toneText}.`
  };

  return templates[parsed.primaryIntent] || templates.talk;
}

function applyFreeAction(parsed) {
  const blueprint = state.sceneBlueprint;
  if (state.beatState?.eventId) {
    const momentum = parsed.primaryIntent === "leave" || parsed.primaryIntent === "refuse" ? -8 : parsed.primaryIntent === "help" || parsed.primaryIntent === "flirt" ? 8 : 5;
    recordBeatAction(parsed.primaryIntent, momentum);
  }
  const target = parsed.target;

  if (target && state.relationships[target] !== undefined) {
    state.relationships[target] += relationshipDeltaForIntent(parsed.primaryIntent, parsed.tone);

    const emotional = emotionalEffectForIntent(parsed.primaryIntent, parsed.tone);
    if (emotional) {
      state.emotions[target][emotional.key] =
        (state.emotions[target][emotional.key] || 0) + emotional.amount;
    }
  }

  if (parsed.primaryIntent === "help" || parsed.primaryIntent === "apologize") {
    state.reputation += 1;
  }

  const memoryId = `free_${parsed.primaryIntent}_${target || "none"}_${state.day}_${state.phaseIndex}_${state.intentHistory.length + 1}`;
  addMemory({
    id: memoryId,
    title: `Free Action: ${parsed.primaryIntent}`,
    participants: ["player", ...(target ? [target] : [])],
    importance: parsed.primaryIntent === "apologize" || parsed.primaryIntent === "help" ? 6 : 4,
    emotion: parsed.tone === "neutral" ? parsed.primaryIntent : parsed.tone,
    tags: ["free_action", state.phase.toLowerCase().replace(/\s+/g,"_")],
    summary: parsed.rawText
  });

  const record = {
    ...parsed,
    day: state.day,
    phase: state.phase,
    eventId: blueprint?.event?.id || null,
    result: {
      relationshipDelta: target ? relationshipDeltaForIntent(parsed.primaryIntent, parsed.tone) : 0,
      reputation: state.reputation
    }
  };

  state.intentHistory.push(record);
  if (state.intentHistory.length > 30) state.intentHistory.shift();

  state.currentResult = {
    title: "Free Action Resolved",
    text:
      `${freeActionNarration(parsed, blueprint)}\n\n` +
      `Intent recognized: ${parsed.primaryIntent}` +
      `${parsed.secondaryIntent ? ` + ${parsed.secondaryIntent}` : ""}\n` +
      `Target: ${parsed.targetName || "None"}\n` +
      `Tone: ${parsed.tone}\n` +
      `Object: ${parsed.object || "None"}`
  };

  buildSceneBlueprint(currentEvent());
  render();
}

function submitFreeAction() {
  const input = document.getElementById("freeActionInput");
  const text = input.value.trim();

  if (!text) {
    document.getElementById("intentPreview").textContent = "Enter an action first.";
    return;
  }

  const parsed = parseIntent(text, state.sceneBlueprint);
  document.getElementById("intentPreview").textContent =
    `Detected: ${parsed.primaryIntent}` +
    `${parsed.secondaryIntent ? ` + ${parsed.secondaryIntent}` : ""}` +
    ` | Target: ${parsed.targetName || "None"}` +
    ` | Tone: ${parsed.tone}` +
    ` | Confidence: ${Math.round(parsed.confidence * 100)}%`;

  applyFreeAction(parsed);
  input.value = "";
}
