"use strict";

/* --------------------------------------------------------------------------
   PHONE UI
-------------------------------------------------------------------------- */
function openPhone() {
  updatePhone();
  document.getElementById("phoneModal").style.display = "flex";
  playBeep(520, 60);
}

function closePhone() {
  document.getElementById("phoneModal").style.display = "none";
}

function showPanel(name) {
  document.querySelectorAll(".panel").forEach(panel => panel.classList.remove("on"));
  document.getElementById(`${name}Panel`).classList.add("on");
}

function updatePhone() {
  updateContacts();
  updateMemories();
  updateCalendar();
  updateMessages();
  updatePlanner();
  updateCommitments();
  updateBlueprint();
  updateBeatFlow();
  updateIntentLog();
  updateSocialWeb();
  updateRumors();
  updateDirectorLog();
  updateDataInspector();
}

function updateContacts() {
  const list = document.getElementById("contactsList");
  list.innerHTML = "";

  Object.entries(CAMPAIGN.characters).forEach(([id, character]) => {
    const known = hasMet(id);
    const card = document.createElement("div");
    card.className = `card${known ? "" : " locked"}`;

    if (!known) {
      card.innerHTML = "<h3>?????</h3><p>Meet this person to unlock their profile.</p>";
    } else {
      const schedule = Object.entries(character.schedule)
        .map(([phase, locations]) => {
          const names = locations.map(locationId => CAMPAIGN.locations[locationId].name).join(" / ");
          return `${phase}: ${names}`;
        })
        .join("<br>");

      const traits = character.traits
        .map(trait => `<span class="badge">${trait}</span>`)
        .join("");

      card.innerHTML = `
        <h3>${character.name}</h3>
        <div>${traits}</div>
        <p><strong>Relationship:</strong> ${relationshipLabel(state.relationships[id])}</p>
        <p><strong>Daily mood:</strong> ${state.moods?.[id] || "neutral"}<br>
        <strong>Longer emotional tilt:</strong> ${dominantEmotion(id)}</p>
        <p><strong>Likes:</strong> ${character.likes.join(", ")}<br>
        <strong>Dislikes:</strong> ${character.dislikes.join(", ")}</p>
        <p><strong>Known schedule:</strong><br>${schedule}</p>
      `;
    }

    list.appendChild(card);
  });
}

function updateMemories() {
  const list = document.getElementById("memoryList");
  if (!state.memories.length) {
    list.innerHTML = '<div class="small">No memories recorded yet.</div>';
    return;
  }

  list.innerHTML = state.memories
    .slice()
    .sort((a, b) => b.importance - a.importance)
    .map(memory => `
      <div class="card memory">
        <h3>${memory.title}</h3>
        <div class="small">Day ${memory.dayCreated} · ${memory.phaseCreated} · Importance ${memory.importance}/10</div>
        <p>${memory.summary}</p>
        <p><strong>Participants:</strong> ${memory.participants.map(characterName).join(", ")}<br>
        <strong>Emotion:</strong> ${memory.emotion}<br>
        <strong>Referenced:</strong> ${memory.timesReferenced} time(s)<br>
        <strong>Current relevance:</strong> ${memoryRelevance(memory)}</p>
        <div>${memory.tags.map(tag => `<span class="badge">${tag}</span>`).join("")}</div>
      </div>
    `).join("");
}

function updateCalendar() {
  const majors=majorEventCountdowns();
  const accepted=state.commitments.filter(c=>c.status==="accepted");
  calendarList.innerHTML=`<div class=card><strong>${formattedDate()}</strong><br>${state.phase}<br>Weather: ${state.weather||"Unknown"}<br>${state.calendar.season} · ${state.calendar.schoolTerm}</div>
  <div class=card><strong>Major Events</strong><br>${majors.map(e=>`${e.title} — ${e.days===0?"Today":`${e.days} day(s)`}`).join("<br>")}</div>
  <div class=card><strong>Accepted Commitments</strong><br>${accepted.length?accepted.map(c=>`${MONTH_NAMES[c.month-1]} ${c.day}: ${c.title} (${c.slot})`).join("<br>"):"None"}</div>`;
}

function updateMessages() {
  const list = document.getElementById("messageList");
  list.innerHTML = state.messages.length
    ? state.messages.map(message => `
        <div class="card">
          <strong>${characterName(message.from)}</strong><br>
          ${message.text}
          <div class="small">Day ${message.day} · ${message.phase}</div>
        </div>
      `).join("")
    : '<div class="small">No messages yet.</div>';
}



function statusBadge(status){return({pending:"Pending",accepted:"Accepted",declined:"Declined",cancelled:"Cancelled",missed:"Missed",completed:"Completed"})[status]||status}
function updatePlanner(){
 let reminders=reminderItems();
 let today=commitmentsForDate(state.calendar.year,state.calendar.month,state.calendar.dayOfMonth);
 let week=[];
 for(let o=0;o<7;o++){let serial=currentDateSerial()+o,items=state.commitments.filter(c=>commitmentDateSerial(c)===serial&&c.status!=="cancelled");if(items.length)week.push({o,items})}
 plannerList.innerHTML=`<div class=card><strong>${formattedDate()}</strong><br>${state.calendar.season} · ${state.calendar.schoolTerm}</div>
 <div class=card><strong>Today</strong><br>${today.length?today.map(c=>`${c.slot}: ${c.title} (${statusBadge(c.status)})`).join("<br>"):"No commitments scheduled."}</div>
 <div class=card><strong>Reminders</strong><br>${reminders.length?reminders.map(r=>`${r.item.title}: ${r.days===0?"Today":`${r.days} day(s)`}`).join("<br>"):"No reminders."}</div>
 <div class=card><strong>Next 7 Days</strong><br>${week.length?week.map(d=>`In ${d.o} day(s): ${d.items.map(i=>i.title).join(", ")}`).join("<br>"):"Nothing scheduled."}</div>`
}
function updateCommitments(){
 if(!state.commitments.length){commitmentList.innerHTML='<div class=small>No commitments yet.</div>';return}
 commitmentList.innerHTML=state.commitments.slice().sort((a,b)=>commitmentDateSerial(a)-commitmentDateSerial(b)).map(c=>{
  let conflicts=findConflicts(c),organizer=c.organizer?characterName(c.organizer):"None";
  let conflictText=conflicts.length?`<div class=bad><strong>⚠ Conflict:</strong> ${conflicts.map(x=>x.title).join(", ")}</div>`:"";
  let controls=c.status==="pending"?`<div class=actions style="margin-top:8px"><button class=center data-commitment="${c.id}" data-status=accepted>Accept</button><button class=center data-commitment="${c.id}" data-status=declined>Decline</button></div>`:c.status==="accepted"?`<div class=actions style="margin-top:8px"><button class=center data-commitment="${c.id}" data-status=cancelled>Cancel</button></div>`:"";
  return `<div class=card><h3>${c.title}</h3><div class=small>${MONTH_NAMES[c.month-1]} ${c.day}, ${c.year} · ${c.slot}</div><p><strong>Organizer:</strong> ${organizer}<br><strong>Importance:</strong> ${c.importance}<br><strong>Status:</strong> ${statusBadge(c.status)}<br><strong>Reminder:</strong> Two-day reminder</p><p>${c.notes}</p>${conflictText}${controls}</div>`
 }).join("");
 commitmentList.querySelectorAll("[data-commitment]").forEach(b=>b.addEventListener("click",()=>{setCommitmentStatus(Number(b.dataset.commitment),b.dataset.status);updateCommitments();updatePlanner()}))
}


function updateBlueprint() {
  const list = document.getElementById("blueprintList");
  const b = state.sceneBlueprint;

  if (!b) {
    list.innerHTML = '<div class="small">No scene blueprint generated yet.</div>';
    return;
  }

  const memoryHtml = b.memories.length
    ? b.memories.map(m => `
        <div class="card memory">
          <strong>${m.title}</strong><br>
          Relevance: ${m.relevance}<br>
          Importance: ${m.importance}<br>
          Emotion: ${m.emotion}
        </div>
      `).join("")
    : '<div class="small">No relevant memories.</div>';

  const conflictHtml = b.conflicts.length
    ? b.conflicts.map(c => `
        <div class="card bad">
          <strong>${c.type}</strong><br>
          ${JSON.stringify(c)}
        </div>
      `).join("")
    : '<div class="small">No active conflicts.</div>';

  list.innerHTML = `
    <div class="card mono"><pre style="white-space:pre-wrap;margin:0">${blueprintSummary(b)}</pre></div>

    <div class="card">
      <strong>World</strong><br>
      Weather: ${b.world.weather}<br>
      Season: ${b.world.season}<br>
      School term: ${b.world.schoolTerm}<br>
      Weekday: ${b.world.weekday}
    </div>

    <div class="card">
      <strong>Cast</strong><br>
      Focus: ${b.cast.focusName || "None"}<br>
      Group: ${b.cast.groupParticipants.length
        ? b.cast.groupParticipants.map(characterName).join(", ")
        : "None"}<br>
      Available: ${b.cast.availableCharacters.map(characterName).join(", ")}
    </div>

    <div class="card">
      <strong>Possible Intents</strong><br>
      ${b.possibleIntents.map(i => `<span class="badge">${i}</span>`).join("")}
    </div>

    <h3>Relevant Memories</h3>
    ${memoryHtml}

    <h3>Conflicts</h3>
    ${conflictHtml}

    <h3>Current Commitments</h3>
    ${b.commitments.length
      ? b.commitments.map(c => `
          <div class="card">
            <strong>${c.title}</strong><br>
            ${c.slot} · ${c.importance} · ${c.status}
          </div>
        `).join("")
      : '<div class="small">No commitments tied to today.</div>'}
  `;
}


function updateIntentLog() {
  const list = document.getElementById("intentList");

  if (!state.intentHistory.length) {
    list.innerHTML = '<div class="small">No free actions submitted yet.</div>';
    return;
  }

  list.innerHTML = state.intentHistory
    .slice()
    .reverse()
    .map(entry => `
      <div class="card mono">
        <strong>${entry.primaryIntent}${entry.secondaryIntent ? ` + ${entry.secondaryIntent}` : ""}</strong><br>
        Target: ${entry.targetName || "None"}<br>
        Tone: ${entry.tone}<br>
        Object: ${entry.object || "None"}<br>
        Confidence: ${Math.round(entry.confidence * 100)}%<br>
        Event: ${entry.eventId || "None"}<br>
        Raw: ${entry.rawText}
      </div>
    `).join("");
}

function updateSocialWeb() {
  const list = document.getElementById("socialList");
  const ids = Object.keys(CAMPAIGN.characters);
  const rows = [];

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i], b = ids[j];
      const value = npcRelation(a, b);
      const label =
        value >= 5 ? "Close" :
        value >= 2 ? "Friendly" :
        value <= -4 ? "Hostile" :
        value <= -1 ? "Tense" : "Neutral";

      rows.push(`
        <div class="card">
          <strong>${characterName(a)} ↔ ${characterName(b)}</strong><br>
          ${label} (${value})
        </div>
      `);
    }
  }

  const recent = state.offscreenEvents.slice(-8).reverse().map(event => `
    <div class="card memory">
      <strong>Day ${event.day} · ${event.phase}</strong><br>
      ${event.text}<br>
      <span class="small">Relationship change: ${event.relationChange >= 0 ? "+" : ""}${event.relationChange}</span>
    </div>
  `).join("");

  list.innerHTML = rows.join("") +
    `<h3 style="margin-top:16px">Recent Off-Screen Events</h3>` +
    (recent || '<div class="small">No off-screen events yet.</div>');
}

function updateRumors() {
  const list = document.getElementById("rumorList");
  list.innerHTML = state.rumors.length
    ? state.rumors.slice().reverse().map(rumor => `
        <div class="card">
          <strong>Day ${rumor.day} · ${rumor.phase}</strong><br>
          ${rumor.text}<br>
          <span class="small">Strength: ${rumor.strength}</span>
        </div>
      `).join("")
    : '<div class="small">No rumors have surfaced yet.</div>';
}

function updateDirectorLog() {
  const list = document.getElementById("directorList");
  list.innerHTML = state.directorLog.length
    ? state.directorLog.map(entry => `
        <div class="card mono ${entry.status}">
          <strong>${entry.eventId}</strong><br>
          Status: ${entry.status}<br>
          Weight: ${entry.weight}<br>
          ${entry.rules.join("<br>")}
        </div>
      `).join("")
    : '<div class="small">No Director decision has been made yet.</div>';
}

function updateDataInspector() {
  document.getElementById("dataList").innerHTML = `
    <div class="card mono">
      Campaign: ${CAMPAIGN.meta.id}<br>
      Engine version: ${CAMPAIGN.meta.version}<br>
      Characters loaded: ${Object.keys(CAMPAIGN.characters).length}<br>
      Locations loaded: ${Object.keys(CAMPAIGN.locations).length}<br>
      Events loaded: ${CAMPAIGN.events.length}<br>
      Calendar events loaded: ${CAMPAIGN.calendarEvents.length}<br>
      Memories stored: ${state.memories.length}<br>
      Mood profiles active: ${Object.keys(state.moods || {}).length}<br>
      NPC social links: ${Object.values(state.npcRelations || {}).reduce((n,row)=>n+Object.keys(row).length,0)/2}<br>
      Off-screen events: ${state.offscreenEvents.length}<br>
      Rumors: ${state.rumors.length}<br>
      Commitments tracked: ${state.commitments.length}<br>
      Commitment history: ${state.commitmentHistory.length}<br>
      Blueprint history: ${state.blueprintHistory.length}<br>
      Intent history: ${state.intentHistory.length}<br>
      Beat history: ${state.beatHistory.length}<br>
      Current blueprint: ${state.sceneBlueprint ? state.sceneBlueprint.event.id : "none"}<br>
      Calendar date: ${formattedDate()}<br>
      Event history entries: ${state.eventHistory.length}<br>
      Recent event records: ${state.recentEvents.length}<br>
      Reputation: ${state.reputation}
    </div>
    <div class="card">
      <strong>Architecture</strong><br>
      Characters, schedules, locations, event requirements, choices, effects, variants, and memory templates are campaign data. The engine evaluates them generically.
    </div>
  `;
}
