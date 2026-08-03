"use strict";

/* --------------------------------------------------------------------------
   RULE ENGINE
-------------------------------------------------------------------------- */
function evaluateRule(rule) {
  switch (rule.type) {
    case "dayEq": return state.day === rule.value;
    case "dayGte": return state.day >= rule.value;
    case "weatherEq": return state.weather === rule.value;
    case "reputationGte": return state.reputation >= rule.value;
    case "relationshipGte": return (state.relationships[rule.character] || 0) >= rule.value;
    case "met": return hasMet(rule.character);
    case "notMet": return !hasMet(rule.character);
    case "memory": return hasMemory(rule.id);
    case "notMemory": return !hasMemory(rule.id);
    default: return false;
  }
}

function requirementsPass(requirements = []) {
  return requirements.every(evaluateRule);
}

function requirementExplanation(rule) {
  const passed = evaluateRule(rule);
  const mark = passed ? "✓" : "✗";
  switch (rule.type) {
    case "dayEq": return `${mark} Day equals ${rule.value}`;
    case "dayGte": return `${mark} Day is at least ${rule.value}`;
    case "weatherEq": return `${mark} Weather equals ${rule.value}`;
    case "reputationGte": return `${mark} Reputation is at least ${rule.value}`;
    case "relationshipGte": return `${mark} ${characterName(rule.character)} bond is at least ${rule.value}`;
    case "met": return `${mark} ${characterName(rule.character)} has been met`;
    case "notMet": return `${mark} ${characterName(rule.character)} has not been met`;
    case "memory": return `${mark} Memory exists: ${rule.id}`;
    case "notMemory": return `${mark} Memory does not exist: ${rule.id}`;
    default: return `${mark} Unknown rule: ${rule.type}`;
  }
}
