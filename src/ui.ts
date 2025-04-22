import { AppState, Participant, SpinLogEntry, Prize } from "./types";
import { getRotationForPrize, getAdjustedProbabilities } from "./game-logic";

// Wheel rendering
export function renderWheel(state: AppState) {
  const canvas = document.getElementById("wheel-canvas") as HTMLCanvasElement;
  const overlay = document.getElementById("wheel-overlay")!;
  if (!hasPrizes(state)) {
    overlay.style.display = "flex";
  } else {
    overlay.style.display = "none";
  }
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
  const adjusted = getAdjustedProbabilities(state, prizes);
  const totalProb = adjusted.reduce((sum, val) => sum + val, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;
  let startAngle = -Math.PI / 2;

  prizes.forEach((prize, i) => {
    const sliceAngle = (adjusted[i] / totalProb) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = ["#a5b4fc", "#facc15", "#fca5a5", "#6ee7b7", "#fdba74"][
      i % 5
    ];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Draw label
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#222";
    ctx.fillText(prize.name, radius - 16, 8);
    ctx.restore();
    startAngle += sliceAngle;
  });
  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 4;
  ctx.stroke();
  // Draw pointer
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius + 0);
  ctx.lineTo(centerX - 18, centerY - radius + 28);
  ctx.lineTo(centerX + 18, centerY - radius + 28);
  ctx.closePath();
  ctx.fillStyle = "#6366f1";
  ctx.fill();
}

// Draw wheel with rotation (for animation)
export function drawWheelWithRotation(state: AppState, rot: number) {
  const canvas = document.getElementById("wheel-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
  const adjusted = getAdjustedProbabilities(state, prizes);
  const totalProb = adjusted.reduce((sum, val) => sum + val, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;
  let startAngle = -Math.PI / 2 + rot;

  prizes.forEach((prize, i) => {
    const sliceAngle = (adjusted[i] / totalProb) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = ["#a5b4fc", "#facc15", "#fca5a5", "#6ee7b7", "#fdba74"][
      i % 5
    ];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Draw label
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#222";
    ctx.fillText(prize.name, radius - 16, 8);
    ctx.restore();
    startAngle += sliceAngle;
  });

  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 4;
  ctx.stroke();
  // Draw pointer
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius + 0);
  ctx.lineTo(centerX - 18, centerY - radius + 28);
  ctx.lineTo(centerX + 18, centerY - radius + 28);
  ctx.closePath();
  ctx.fillStyle = "#6366f1";
  ctx.fill();
}

// Helper to check if prizes remain
function hasPrizes(state: AppState) {
  return Object.values(state.prizesState).some((count) => count > 0);
}

// Render bowl (show count label)
export function renderBowl(state: AppState, onDraw: (pid: string) => void) {
  const label = document.getElementById("bowl-count-label")!;
  label.textContent = `剩餘參與者:${state.bowl.length}`;
  const bowlDiv = document.getElementById("bowl")!;
  // Disable bowl if a participant is already selected or no prizes remain
  if (state.drawnParticipantId || !hasPrizes(state)) {
    bowlDiv.style.pointerEvents = "none";
    bowlDiv.style.opacity = "0.6";
  } else {
    bowlDiv.style.pointerEvents = "auto";
    bowlDiv.style.opacity = "1";
    bowlDiv.onclick = () => {
      if (state.bowl.length === 0 || !hasPrizes(state)) return;
      const idx = Math.floor(Math.random() * state.bowl.length);
      onDraw(state.bowl[idx]);
    };
  }
}

// Render log/history table
export function renderLog(state: AppState) {
  const logBody = document.getElementById("log-body")!;
  logBody.innerHTML = "";
  state.log.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${entry.spin}</td><td>${entry.participant}</td><td>${entry.prize}</td>`;
    logBody.appendChild(tr);
  });
}

// Render current participant
export function renderCurrentParticipant(state: AppState) {
  const cpDiv = document.getElementById("current-participant")!;
  const spinBtn = document.getElementById("spin-btn") as HTMLButtonElement;
  if (state.drawnParticipantId) {
    const p = state.participants.find((x) => x.id === state.drawnParticipantId);
    cpDiv.textContent = p ? `參與者: ${p.name}` : "";
    // Only enable spin if no spin is pending and prizes remain
    spinBtn.disabled = !!state.pendingSpin || !hasPrizes(state);
  } else {
    cpDiv.textContent = "";
    spinBtn.disabled = true;
  }
}
