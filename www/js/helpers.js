"use strict";

/* --------------------------------------------------------------------------
   GENERIC HELPERS
-------------------------------------------------------------------------- */
function characterName(id) {
  return id === "player" ? "Player" : (CAMPAIGN.characters[id]?.name || id);
}

function relationshipLabel(value) {
  if (value <= 0) return "Distant";
  if (value <= 2) return "Acquaintance";
  if (value <= 5) return "Curious";
  if (value <= 8) return "Comfortable";
  if (value <= 12) return "Close";
  return "Deeply Attached";
}

function hasMemory(id) {
  return state.memories.some(memory => memory.id === id);
}

function hasMet(character) {
  return state.met.includes(character);
}

function dominantEmotion(character) {
  const entries = Object.entries(state.emotions[character] || {});
  entries.sort((a, b) => b[1] - a[1]);
  return entries.length && entries[0][1] > 0 ? entries[0][0] : "neutral";
}


function memoryRelevance(memory, characterId = null, event = null) {
  let score = memory.importance || 1;

  const age = Math.max(0, state.day - (memory.lastReferencedDay || memory.dayCreated || state.day));
  score -= age * 0.8;

  if (characterId && memory.participants?.includes(characterId)) score += 3;
  if (event?.focus && memory.participants?.includes(event.focus)) score += 2;

  const eventTags = new Set([
    event?.phase?.toLowerCase().replace(/\s+/g, "_"),
    ...(CAMPAIGN.locations[event?.location]?.tags || [])
  ].filter(Boolean));

  const matchingTags = (memory.tags || []).filter(tag => eventTags.has(tag));
  score += matchingTags.length * 1.5;

  const mood = characterId ? state.moods?.[characterId] : null;
  if (mood && memory.emotion === mood) score += 2;

  return Math.max(0, Number(score.toFixed(1)));
}

function topRelevantMemory(characterId, event) {
  const candidates = state.memories
    .filter(memory => memory.participants?.includes(characterId))
    .map(memory => ({ memory, score: memoryRelevance(memory, characterId, event) }))
    .filter(entry => entry.score >= 5)
    .sort((a, b) => b.score - a.score);

  return candidates[0] || null;
}

function rollDailyMoods() {
  const moodPool = ["calm", "cheerful", "tired", "guarded", "embarrassed", "irritated"];
  Object.keys(CAMPAIGN.characters).forEach(id => {
    const emotionMap = state.emotions[id] || {};
    const strongest = Object.entries(emotionMap).sort((a, b) => b[1] - a[1])[0];

    if (strongest && strongest[1] >= 3) {
      const map = {
        curiosity: "guarded",
        trust: "calm",
        embarrassment: "embarrassed",
        jealousy: "irritated",
        joy: "cheerful"
      };
      state.moods[id] = map[strongest[0]] || "calm";
    } else {
      state.moods[id] = moodPool[Math.floor(Math.random() * moodPool.length)];
    }
  });
}

function moodWeightModifier(characterId) {
  const mood = state.moods?.[characterId] || "neutral";
  const map = {
    cheerful: 1.2,
    calm: 1.08,
    embarrassed: 1.05,
    guarded: 0.9,
    tired: 0.82,
    irritated: 0.78,
    neutral: 1
  };
  return map[mood] || 1;
}


function npcRelation(a, b) {
  return state.npcRelations?.[a]?.[b] ?? 0;
}

function adjustNpcRelation(a, b, amount) {
  if (!state.npcRelations[a]) state.npcRelations[a] = {};
  if (!state.npcRelations[b]) state.npcRelations[b] = {};
  state.npcRelations[a][b] = (state.npcRelations[a][b] || 0) + amount;
  state.npcRelations[b][a] = (state.npcRelations[b][a] || 0) + amount;
}

function addRumor(rumor) {
  const exists = state.rumors.some(r => r.id === rumor.id && r.day === state.day);
  if (!exists) {
    state.rumors.push({
      ...rumor,
      day: state.day,
      phase: state.phase,
      strength: rumor.strength ?? 1
    });
  }
}

function availableNpcIdsForPhase(phase) {
  return Object.keys(CAMPAIGN.characters).filter(id => {
    const schedule = CAMPAIGN.characters[id].schedule?.[phase];
    return Array.isArray(schedule) && schedule.length > 0;
  });
}

function simulateOffscreenSocialWorld() {
  const ids = availableNpcIdsForPhase(state.phase);
  if (ids.length < 2) return;

  const shuffled = ids.slice().sort(() => Math.random() - 0.5);
  const a = shuffled[0];
  const b = shuffled[1];

  const templates = [
    {
      id: "shared_lunch",
      text: `${characterName(a)} and ${characterName(b)} shared lunch without the player.`,
      relation: 2,
      rumorChance: 0.15
    },
    {
      id: "small_disagreement",
      text: `${characterName(a)} and ${characterName(b)} had a minor disagreement.`,
      relation: -1,
      rumorChance: 0.35
    },
    {
      id: "helped_with_task",
      text: `${characterName(a)} helped ${characterName(b)} with a school task.`,
      relation: 1,
      rumorChance: 0.1
    },
    {
      id: "unexpected_conversation",
      text: `${characterName(a)} and ${characterName(b)} had an unexpectedly long conversation.`,
      relation: 1,
      rumorChance: 0.25
    }
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  adjustNpcRelation(a, b, template.relation);

  const record = {
    id: `${template.id}_${a}_${b}_${state.day}_${state.phaseIndex}`,
    day: state.day,
    phase: state.phase,
    participants: [a, b],
    text: template.text,
    relationChange: template.relation
  };
  state.offscreenEvents.push(record);

  if (Math.random() < template.rumorChance) {
    addRumor({
      id: `rumor_${template.id}_${a}_${b}`,
      about: [a, b],
      text: `${characterName(a)} and ${characterName(b)} were seen together during ${state.phase.toLowerCase()}.`,
      strength: 1 + Math.abs(template.relation)
    });
  }

  if (state.offscreenEvents.length > 30) state.offscreenEvents.shift();
  if (state.rumors.length > 20) state.rumors.shift();
}

function socialGroupBonus(event) {
  const participants = event.groupParticipants || [];
  if (participants.length < 2) return 1;

  let total = 0;
  let count = 0;
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      total += npcRelation(participants[i], participants[j]);
      count++;
    }
  }

  if (!count) return 1;
  const avg = total / count;
  if (avg >= 4) return 1.35;
  if (avg >= 1) return 1.15;
  if (avg <= -3) return 0.7;
  return 1;
}


const WEEKDAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_IN_MONTH=[31,28,31,30,31,30,31,31,30,31,30,31];
const MAJOR_EVENTS=[
 {id:"welcome_festival",title:"Welcome Festival",month:4,day:18,type:"major"},
 {id:"midterms",title:"Midterm Exams",month:5,day:11,type:"major",durationDays:3},
 {id:"summer_break",title:"Summer Break",month:7,day:20,type:"major",durationDays:35},
 {id:"finals",title:"Final Exams",month:12,day:7,type:"major",durationDays:4}
];
function dateSerial(y,m,d){let t=y*365+d;for(let i=1;i<m;i++)t+=DAYS_IN_MONTH[i-1];return t}
function currentDateSerial(){let c=state.calendar;return dateSerial(c.year,c.month,c.dayOfMonth)}
function formattedDate(){let c=state.calendar;return `${WEEKDAYS[c.weekdayIndex]}, ${MONTH_NAMES[c.month-1]} ${c.dayOfMonth}, ${c.year}`}
function updateSeasonAndTerm(){let m=state.calendar.month;state.calendar.season=[3,4,5].includes(m)?"Spring":[6,7,8].includes(m)?"Summer":[9,10,11].includes(m)?"Autumn":"Winter";state.calendar.schoolTerm=(m===7||m===8)?"Summer Break":(m>=4&&m<=7)?"Spring Term":(m>=9&&m<=12)?"Autumn Term":"Winter Term"}
function advanceCalendarDay(){let c=state.calendar;c.dayOfMonth++;c.weekdayIndex=(c.weekdayIndex+1)%7;if(c.dayOfMonth>DAYS_IN_MONTH[c.month-1]){c.dayOfMonth=1;c.month++;if(c.month>12){c.month=1;c.year++}}updateSeasonAndTerm();refreshCommitmentStatuses()}
function commitmentDateSerial(c){return dateSerial(c.year,c.month,c.day)}
function daysUntilCommitment(c){return commitmentDateSerial(c)-currentDateSerial()}
function commitmentsForDate(y,m,d){return state.commitments.filter(c=>c.year===y&&c.month===m&&c.day===d&&c.status!=="cancelled")}
function findConflicts(c){return state.commitments.filter(o=>o.id!==c.id&&o.status==="accepted"&&c.status==="accepted"&&o.year===c.year&&o.month===c.month&&o.day===c.day&&o.slot===c.slot)}
function addCommitment(data){let c={id:state.nextCommitmentId++,title:data.title,organizer:data.organizer||null,year:data.year??state.calendar.year,month:data.month??state.calendar.month,day:data.day??state.calendar.dayOfMonth,slot:data.slot||"After School",importance:data.importance||"planned",status:data.status||"pending",reminderMode:data.reminderMode||"two_day",notes:data.notes||"",createdDay:state.day};state.commitments.push(c);return c}
function setCommitmentStatus(id,status){let c=state.commitments.find(x=>x.id===id);if(!c)return;c.status=status;if(["declined","cancelled"].includes(status))state.commitmentHistory.push({commitmentId:c.id,title:c.title,result:status,day:state.day});updatePhone()}
function refreshCommitmentStatuses(){let today=currentDateSerial();state.commitments.forEach(c=>{let due=commitmentDateSerial(c);if(due<today&&["pending","accepted"].includes(c.status)){c.status="missed";state.commitmentHistory.push({commitmentId:c.id,title:c.title,result:"missed",day:state.day});if(c.organizer&&state.relationships[c.organizer]!==undefined){let p=c.importance==="critical"?-3:c.importance==="important"?-2:-1;state.relationships[c.organizer]+=p}}})}
function seedCommitmentsIfNeeded(){if(state.commitments.length)return;addCommitment({title:"Festival Logistics Meeting",organizer:"reina",year:2026,month:4,day:8,slot:"After School",importance:"important",status:"pending",notes:"Reina asked for help preparing logistics."});addCommitment({title:"Bakery Trip",organizer:"chiyo",year:2026,month:4,day:8,slot:"After School",importance:"planned",status:"pending",notes:"Chiyo wants to visit the new bakery."});addCommitment({title:"Mystery Bookstore Visit",organizer:"mio",year:2026,month:4,day:9,slot:"After School",importance:"casual",status:"pending",notes:"Mio mentioned a new mystery release."})}
function majorEventCountdowns(){let now=currentDateSerial();return MAJOR_EVENTS.map(e=>({...e,days:dateSerial(state.calendar.year,e.month,e.day)-now})).filter(e=>e.days>=0).sort((a,b)=>a.days-b.days)}
function reminderItems(){let regular=state.commitments.filter(c=>["pending","accepted"].includes(c.status)).map(c=>({kind:"commitment",item:c,days:daysUntilCommitment(c)})).filter(x=>x.days>=0&&x.days<=2);let major=majorEventCountdowns().map(e=>({kind:"major",item:e,days:e.days}));return [...regular,...major].sort((a,b)=>a.days-b.days)}

function chooseWeather() {
  if (state.weather) return;
  const roll = Math.random();
  state.weather = roll < 0.24 ? "Rain" : roll < 0.73 ? "Clear" : "Cloudy";
}

function playBeep(frequency = 440, duration = 70) {
  if (!state.sound) return;
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.value = 0.035;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration / 1000);
    oscillator.stop(context.currentTime + duration / 1000);
  } catch (_) {}
}
