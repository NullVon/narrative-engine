"use strict";

/* --------------------------------------------------------------------------
   DICE
-------------------------------------------------------------------------- */
let pendingRollChoice = null;

function showDiceForChoice(choice) {
  pendingRollChoice = choice;
  document.getElementById("choices").innerHTML = "";
  document.getElementById("diceBox").style.display = "block";
  document.getElementById("dicePrompt").textContent =
    `Difficulty Class: ${choice.roll.dc}`;
  document.getElementById("die").textContent = "—";
  const button = document.getElementById("rollButton");
  button.disabled = false;
  button.onclick = performRoll;
}

function performRoll() {
  if (!pendingRollChoice) return;

  const button = document.getElementById("rollButton");
  button.disabled = true;
  const die = document.getElementById("die");
  let flashes = 0;

  const timer = setInterval(() => {
    die.textContent = String(Math.floor(Math.random() * 20) + 1);
    playBeep(220 + flashes * 18, 20);
    flashes += 1;

    if (flashes >= 12) {
      clearInterval(timer);
      const result = Math.floor(Math.random() * 20) + 1;
      const success = result >= pendingRollChoice.roll.dc;
      die.textContent = String(result);

      const effects = success
        ? pendingRollChoice.roll.successEffects
        : pendingRollChoice.roll.failureEffects;

      applyEffects(effects || []);
      state.currentResult = {
        title: success ? "Success" : "Failure",
        text: success
          ? pendingRollChoice.roll.successText
          : pendingRollChoice.roll.failureText
      };

      playBeep(success ? 780 : 170, 130);
      pendingRollChoice = null;

      setTimeout(render, 700);
    }
  }, 65);
}
