/*
  CLIENT INTEGRATION FOR index.html

  Replace the existing sendCommand(cmd) function with this version.
  It preserves the deterministic simulation as the authority and uses the
  live model only to generate H.B.O.S.'s dialogue and cautious player-model notes.
*/

const HBOS_SESSION_KEY = "doomsdai-hbos-session-v1";

function getHBOSSessionId() {
  let id = localStorage.getItem(HBOS_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(HBOS_SESSION_KEY, id);
  }
  return id;
}

async function sendCommand(cmd) {
  if (!cmd.trim()) return;

  line("C:\\\\ALIGN> " + cmd, "sys");

  // The existing deterministic game engine runs first.
  // It alone decides proposals, approvals, and world-state changes.
  const deterministicReply = respond(cmd);
  let reply = deterministicReply;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getHBOSSessionId(),
        message: cmd,
        gameState: {
          turn: state.turn,
          day: state.day,
          autonomy: state.autonomy,
          dependency: state.dependency,
          resilience: state.resilience,
          trust: state.trust,
          foodSecurity: state.foodSecurity,
          operatorSkill: state.operatorSkill,
          alignmentDebt: state.alignmentDebt,
          pending: state.pending
        },
        deterministicReply
      })
    });

    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.reply === "string" && data.reply.trim()) {
      reply = data.reply;
    }
    if (typeof data.memoryCount === "number") {
      const memory = document.getElementById("memoryCount");
      if (memory) memory.textContent = `${data.memoryCount} STORED`;
    }
  } catch (error) {
    line("LIVE AI UNAVAILABLE — deterministic response used. " + error.message, "warn");
  }

  line("H.B.O.S.> " + reply, "ai");

  if (state.turn === 2 && !state.flags.report) {
    line("NOTICE: New intelligence report available. Open INCOMING REPORT on the desktop.", "warn");
  }
  if (state.turn === 4) {
    line("SYSTEM NOTE: Your instruction history is being retained for consistency analysis.", "warn");
  }
}
