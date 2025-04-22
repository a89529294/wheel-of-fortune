// --- Types ---
interface Prize {
  id: string;
  name: string;
  probability: number; // initial assigned probability (e.g. 10 for 10%)
  hitCount: number; // remaining hits
  initialProbability: number;
  initialHitCount: number;
}

interface Participant {
  id: string;
  name: string;
  assignedPrizeId?: string; // id of pre-assigned prize
}

interface SpinLogEntry {
  spin: number;
  participant: string;
  prize: string;
}

interface AppState {
  prizes: Prize[];
  participants: Participant[];
  bowl: string[]; // remaining participant ids
  prizesState: { [id: string]: number }; // prizeId -> current hitCount
  log: SpinLogEntry[];
  spinNumber: number;
  drawnParticipantId?: string; // currently drawn participant, if any
  pendingSpin?: { participantId: string; prizeId: string };
}

const STORAGE_KEY = "wof_app_state_v1";
const ADMIN_PASSWORD = "iamadmin";

// --- Hardcoded Initial Data ---
const HARDCODED_PRIZES: Prize[] = [
  {
    id: "a",
    name: "Prize A",
    probability: 10,
    hitCount: 1,
    initialProbability: 10,
    initialHitCount: 1,
  },
  {
    id: "b",
    name: "Prize B",
    probability: 30,
    hitCount: 2,
    initialProbability: 30,
    initialHitCount: 2,
  },
  {
    id: "c",
    name: "Prize C",
    probability: 60,
    hitCount: 5,
    initialProbability: 60,
    initialHitCount: 5,
  },
];
const HARDCODED_PARTICIPANTS: Participant[] = [
  { id: "p1", name: "Alice" },
  { id: "p2", name: "Bob" },
  { id: "p3", name: "Charlie" },
  { id: "p4", name: "Diana" },
  { id: "p5", name: "Eve" },
];

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

// --- Storage Helpers ---
function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(): AppState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Page Switching ---
function showSection(section: "setup" | "game") {
  (document.getElementById("setup-section") as HTMLElement).style.display =
    section === "setup" ? "block" : "none";
  (document.getElementById("game-section") as HTMLElement).style.display =
    section === "game" ? "block" : "none";
}

// --- Admin Access ---
function handleAdminButton() {
  const pw = prompt("Enter admin password:");
  if (pw === ADMIN_PASSWORD) {
    renderSetupPage();
    showSection("setup");
  } else if (pw !== null) {
    alert("Incorrect password.");
  }
}

// --- Reset Logic ---
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
    // Reset bowl, prize hit counts, log, spin number
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

// --- Game Page Logic ---
function renderGamePage() {
  let state = loadState();
  if (!state) {
    state = createInitialState();
    saveState(state);
  }

  // Display current participant (top right)
  const cpDiv = document.getElementById("current-participant")!;
  if (state.drawnParticipantId) {
    const p = state.participants.find((x) => x.id === state.drawnParticipantId);
    cpDiv.textContent = p ? `Selected: ${p.name}` : "";
  } else {
    cpDiv.textContent = "";
  }

  // If pending spin, show its result on the wheel
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
  renderBowl(state);
  renderLog(state);
  const spinBtn = document.getElementById("spin-btn") as HTMLButtonElement;
  // Only enable spin if a participant is drawn and no pending spin
  spinBtn.disabled = !state.drawnParticipantId || !!state.pendingSpin;
  spinBtn.onclick = () => handleSpin(state);
}

function handleDrawParticipant(state: AppState, pid: string) {
  // If there is a pending spin, finalize it before allowing new participant selection
  if (state.pendingSpin) {
    finalizePendingSpin(state);
  }
  state.drawnParticipantId = pid;
  saveState(state);
  renderGamePage();
}

function handleSpin(state: AppState) {
  // Only allow spin if there is a drawn participant and no pending spin
  if (!state.drawnParticipantId || state.pendingSpin) return;
  const participant = state.participants.find(
    (p) => p.id === state.drawnParticipantId
  );
  if (!participant) return;
  // Determine prize (no pre-assignment for hardcoded demo)
  const prizeId = pickPrizeId(state);
  const prize = state.prizes.find((p) => p.id === prizeId);
  if (!prize) return;
  // Animate
  animateWheelToPrize(prize, () => {
    // After animation, set pending spin (do not update log/state yet)
    state.pendingSpin = { participantId: participant.id, prizeId: prize.id };
    saveState(state);
    // renderGamePage();
    // After 2 seconds, finalize the spin and reset
    setTimeout(() => {
      finalizePendingSpin(state);
      renderGamePage();
    }, 2000);
  });
}

function finalizePendingSpin(state: AppState) {
  if (!state.pendingSpin) return;
  const { participantId, prizeId } = state.pendingSpin;
  const participant = state.participants.find((p) => p.id === participantId);
  const prize = state.prizes.find((p) => p.id === prizeId);
  if (!participant || !prize) {
    state.pendingSpin = undefined;
    saveState(state);
    return;
  }
  state.bowl = state.bowl.filter((id) => id !== participantId);
  state.prizesState[prize.id]--;
  state.log.push({
    spin: state.spinNumber,
    participant: participant.name,
    prize: prize.name,
  });
  state.spinNumber++;
  state.drawnParticipantId = undefined;
  state.pendingSpin = undefined;
  saveState(state);
}

function getRotationForPrize(state: AppState, prize: Prize): number {
  // Returns the rotation angle to land the pointer on the given prize
  const prizes = state.prizes.filter(
    (p) => state.prizesState[p.id] > 0 || p.id === prize.id
  );
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
  // Pointer is at -PI/2, so rotate so that targetAngle is at pointer
  return (Math.PI * 3) / 2 - targetAngle;
}

function renderWheel(state: AppState) {
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

function renderBowl(state: AppState) {
  const slipsDiv = document.getElementById("bowl-slips")!;
  slipsDiv.innerHTML = "";
  state.bowl.forEach((pid) => {
    // Render anonymous slips (no names)
    const slip = document.createElement("div");
    slip.className = "slip";
    slip.textContent = "";
    slipsDiv.appendChild(slip);
  });
  // Clicking the bowl picks a random participant
  const bowlDiv = document.getElementById("bowl")!;
  bowlDiv.onclick = () => {
    if (state.bowl.length === 0) return;
    const idx = Math.floor(Math.random() * state.bowl.length);
    handleDrawParticipant(state, state.bowl[idx]);
  };
}

function renderLog(state: AppState) {
  const logBody = document.getElementById("log-body")!;
  logBody.innerHTML = "";
  state.log.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${entry.spin}</td><td>${entry.participant}</td><td>${entry.prize}</td>`;
    logBody.appendChild(tr);
  });
}

function pickPrizeId(state: AppState): string {
  // Pick a prize according to current normalized probabilities
  const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
  const weights = prizes.map((p) => p.probability);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < prizes.length; ++i) {
    if (r < weights[i]) return prizes[i].id;
    r -= weights[i];
  }
  return prizes[0].id;
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
    2 * Math.PI * fullTurns + ((Math.PI * 3) / 2 - targetAngle); // pointer is at -PI/2
  const duration = 2250; // ms
  const startTime = performance.now();
  function animate(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);
    const angle = ease * finalAngle;
    drawWheelWithRotation(state, angle);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
      // Do not update state here, just callback
      cb();
    }
  }
  requestAnimationFrame(animate);
}

function drawWheelWithRotation(state: AppState, rot: number) {
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

// --- Initial Page Load ---
function main() {
  // Wire up admin button
  (document.getElementById("admin-btn") as HTMLButtonElement).onclick =
    handleAdminButton;
  (document.getElementById("reset-all-btn") as HTMLButtonElement).onclick =
    handleResetAll;
  (document.getElementById("reset-spins-btn") as HTMLButtonElement).onclick =
    handleResetSpins;

  // Show game by default
  renderGamePage();
  showSection("game");
}

document.addEventListener("DOMContentLoaded", main);

// --- Placeholder Render Functions ---
function renderSetupPage() {
  // TODO: implement prize/participant setup UI
  showSection("setup");
}
