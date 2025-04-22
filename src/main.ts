import { AppState } from "./types";
import {
  HARDCODED_PRIZES,
  HARDCODED_PARTICIPANTS,
  ADMIN_PASSWORD,
} from "./constants";
import { saveState, loadState, clearState } from "./storage";
import {
  pickPrizeId,
  finalizePendingSpin,
  getRotationForPrize,
} from "./game-logic";
import {
  renderWheel,
  drawWheelWithRotation,
  renderBowl,
  renderLog,
  renderCurrentParticipant,
} from "./ui";
import Toastify from "toastify-js";

function createInitialState(): AppState {
  const prizesState: { [id: string]: number } = {};
  HARDCODED_PRIZES.forEach((prize) => {
    prizesState[prize.id] = prize.initialHitCount;
  });
  return {
    prizes: HARDCODED_PRIZES.map((p) => ({ ...p })),
    participants: HARDCODED_PARTICIPANTS.map((p) => ({ ...p })),
    bowl: HARDCODED_PARTICIPANTS.map((p) => p.id),
    prizesState,
    log: [],
    spinNumber: 1,
    drawnParticipantId: undefined,
    pendingSpin: undefined,
  };
}

function showSection(section: "setup" | "game") {
  (document.getElementById("setup-section") as HTMLElement).style.display =
    section === "setup" ? "block" : "none";
  (document.getElementById("game-section") as HTMLElement).style.display =
    section === "game" ? "block" : "none";
}

function handleAdminButton() {
  const pw = prompt("Enter admin password:");
  if (pw === ADMIN_PASSWORD) {
    renderSetupPage();
    showSection("setup");
  } else if (pw !== null) {
    alert("Incorrect password.");
  }
}

function handleResetAll() {
  if (
    confirm(
      "Reset ALL data? This will clear all prizes, participants, and log."
    )
  ) {
    clearState();
    renderSetupPage();
  }
}

function handleResetSpins() {
  if (
    confirm(
      "Reset spins? This will restore all participants to the bowl, reset prize hit counts and log. Prizes and participants will be kept."
    )
  ) {
    const state = loadState();
    if (!state) return;
    state.bowl = state.participants.map((p) => p.id);
    state.prizesState = {};
    state.prizes.forEach((prize) => {
      state.prizesState[prize.id] = prize.initialHitCount;
    });
    state.log = [];
    state.spinNumber = 1;
    state.drawnParticipantId = undefined;
    state.pendingSpin = undefined;
    saveState(state);
    renderGamePage();
  }
}

function renderGamePage() {
  let state = loadState();
  if (!state) {
    state = createInitialState();
    saveState(state);
  }
  renderCurrentParticipant(state);
  if (state.pendingSpin) {
    const prize = state.prizes.find((p) => p.id === state.pendingSpin!.prizeId);
    if (prize) {
      drawWheelWithRotation(state, getRotationForPrize(state, prize));
    } else {
      renderWheel(state);
    }
  } else {
    renderWheel(state);
  }
  renderBowl(state, (pid) => handleDrawParticipant(state, pid));
  renderLog(state);
  const spinBtn = document.getElementById("spin-btn") as HTMLButtonElement;
  spinBtn.disabled = !state.drawnParticipantId || !!state.pendingSpin;
  spinBtn.onclick = () => handleSpin(state);
}

function handleDrawParticipant(state: AppState, pid: string) {
  if (state.pendingSpin) {
    finalizePendingSpin(state);
  }
  state.drawnParticipantId = pid;
  saveState(state);
  renderGamePage();
}

let animating = false;
function animateWheelToPrize(prize: Prize, cb: () => void) {
  if (animating) return;
  animating = true;
  const canvas = document.getElementById("wheel-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const state = loadState();
  if (!state) {
    cb();
    animating = false;
    return;
  }
  const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
  const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
  let angles: { id: string; start: number; end: number }[] = [];
  let angle = -Math.PI / 2;
  for (const p of prizes) {
    const slice = (p.probability / totalProb) * 2 * Math.PI;
    angles.push({ id: p.id, start: angle, end: angle + slice });
    angle += slice;
  }
  const target = angles.find((a) => a.id === prize.id)!;
  const targetAngle = (target.start + target.end) / 2;
  const fullTurns = 4;
  const finalAngle =
    2 * Math.PI * fullTurns + ((Math.PI * 3) / 2 - targetAngle);
  const duration = 2250;
  const startTime = performance.now();
  function animate(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const angle = ease * finalAngle;
    drawWheelWithRotation(state, angle);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
      cb();
    }
  }
  requestAnimationFrame(animate);
}

function handleSpin(state: AppState) {
  if (!state.drawnParticipantId || state.pendingSpin) return;
  const participant = state.participants.find(
    (p) => p.id === state.drawnParticipantId
  );
  if (!participant) return;
  const prizeId = pickPrizeId(state);
  const prize = state.prizes.find((p) => p.id === prizeId);
  if (!prize) return;
  animateWheelToPrize(prize, () => {
    state.pendingSpin = { participantId: participant.id, prizeId: prize.id };
    saveState(state);
    // Show toast immediately after spin stops
    Toastify({
      text: `Congrats to ${participant.name} for winning ${prize.name}!`,
      duration: 2000,
      gravity: "top",
      position: "left",
      close: false,
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "18px",
      },
      stopOnFocus: false,
    }).showToast();
    // After 2 seconds, reload state, finalize spin, save, and re-render
    setTimeout(() => {
      let freshState = loadState();
      if (!freshState) return;
      finalizePendingSpin(freshState);
      saveState(freshState);
      renderGamePage();
    }, 2000);
  });
}

function renderSetupPage() {
  // TODO: implement prize/participant setup UI
  showSection("setup");
}

function main() {
  (document.getElementById("admin-btn") as HTMLButtonElement).onclick =
    handleAdminButton;
  (document.getElementById("reset-all-btn") as HTMLButtonElement).onclick =
    handleResetAll;
  (document.getElementById("reset-spins-btn") as HTMLButtonElement).onclick =
    handleResetSpins;
  renderGamePage();
  showSection("game");
}

document.addEventListener("DOMContentLoaded", main);
