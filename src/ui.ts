import { AppState, Participant, SpinLogEntry, Prize } from './types';
import { getRotationForPrize } from './game-logic';

// Wheel rendering
export function renderWheel(state: AppState) {
  const canvas = document.getElementById("wheel-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
  const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;
  let startAngle = -Math.PI / 2;
  prizes.forEach((prize, i) => {
    const sliceAngle = (prize.probability / totalProb) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = ["#a5b4fc", "#facc15", "#fca5a5", "#6ee7b7", "#fdba74"][i % 5];
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
  ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 4;
  ctx.stroke();
  // Draw pointer
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius - 10);
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
  const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 200;
  let startAngle = -Math.PI / 2 + rot;
  prizes.forEach((prize, i) => {
    const sliceAngle = (prize.probability / totalProb) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = ["#a5b4fc", "#facc15", "#fca5a5", "#6ee7b7", "#fdba74"][i % 5];
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
  ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 4;
  ctx.stroke();
  // Draw pointer
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius - 10);
  ctx.lineTo(centerX - 18, centerY - radius + 28);
  ctx.lineTo(centerX + 18, centerY - radius + 28);
  ctx.closePath();
  ctx.fillStyle = "#6366f1";
  ctx.fill();
}

// Render bowl (show count label)
export function renderBowl(state: AppState, onDraw: (pid: string) => void) {
  const label = document.getElementById("bowl-count-label")!;
  label.textContent = `剩餘參與者:${state.bowl.length}`;
  // Keep bowl clickable
  const bowlDiv = document.getElementById("bowl")!;
  bowlDiv.onclick = () => {
    if (state.bowl.length === 0) return;
    const idx = Math.floor(Math.random() * state.bowl.length);
    onDraw(state.bowl[idx]);
  };
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
  if (state.drawnParticipantId) {
    const p = state.participants.find((x) => x.id === state.drawnParticipantId);
    cpDiv.textContent = p ? `Selected: ${p.name}` : "";
  } else {
    cpDiv.textContent = "";
  }
}
