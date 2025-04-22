// Prize management logic for setup.html (TypeScript)
// All UI text is in Traditional Chinese, logic in English

import { Prize, AppState, Participant } from "./types";
import { STORAGE_KEY, loadState, saveState } from "./storage";

// --- Prize Management ---
function getAppState(): AppState {
  const state = loadState();
  if (state) return state;
  // If no state, initialize a minimal one and persist it
  const initState: AppState = {
    prizes: [],
    participants: [],
    bowl: [],
    prizesState: {},
    log: [],
    spinNumber: 1,
  };
  saveState(initState);
  return initState;
}

function renderPrizeTable() {
  const state = getAppState();
  const prizes = state.prizes;
  const tbody = document.querySelector(
    "#prizes-table tbody"
  ) as HTMLTableSectionElement;
  tbody.innerHTML = "";
  prizes.forEach((prize, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${prize.name}</td>
      <td>${prize.initialProbability}</td>
      <td>${prize.initialHitCount}</td>
      <td>
        <button class="edit-prize-btn" data-idx="${idx}">編輯</button>
        <button class="delete-prize-btn" data-idx="${idx}">刪除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openPrizeModal() {
  (document.getElementById("prize-modal") as HTMLElement).classList.remove(
    "hidden"
  );
  (document.getElementById("overlay") as HTMLElement).classList.remove(
    "hidden"
  );
  (document.getElementById("prize-form") as HTMLFormElement).reset();
}

function closePrizeModal() {
  (document.getElementById("prize-modal") as HTMLElement).classList.add(
    "hidden"
  );
  (document.getElementById("overlay") as HTMLElement).classList.add("hidden");
}

function showPrizeModal(editIdx?: number) {
  const modal = document.getElementById("prize-modal");
  const form = document.getElementById("prize-form") as HTMLFormElement;
  const nameInput = document.getElementById("prize-name") as HTMLInputElement;
  const probInput = document.getElementById("prize-probability") as HTMLInputElement;
  const hitInput = document.getElementById("prize-hitcount") as HTMLInputElement;
  const title = document.getElementById("prize-modal-title");
  const overlay = document.getElementById("overlay");
  if (!modal || !form || !nameInput || !probInput || !hitInput || !title || !overlay) return;
  const state = getAppState();
  if (typeof editIdx === "number") {
    // Edit mode
    const prize = state.prizes[editIdx];
    nameInput.value = prize.name;
    probInput.value = String(prize.initialProbability);
    hitInput.value = String(prize.initialHitCount);
    title.textContent = "編輯獎項";
    form.dataset.editIdx = String(editIdx);
  } else {
    // Add mode
    nameInput.value = "";
    probInput.value = "";
    hitInput.value = "";
    title.textContent = "新增獎項";
    delete form.dataset.editIdx;
  }
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function handleAddPrize(e: Event) {
  e.preventDefault();
  const name = (
    document.getElementById("prize-name") as HTMLInputElement
  ).value.trim();
  const initialProbability = parseInt(
    (document.getElementById("prize-probability") as HTMLInputElement).value,
    10
  );
  const initialHitCount = parseInt(
    (document.getElementById("prize-hitcount") as HTMLInputElement).value,
    10
  );
  if (!name || isNaN(initialProbability) || isNaN(initialHitCount)) {
    alert("請填寫所有欄位");
    return;
  }
  const state = getAppState();
  const form = document.getElementById("prize-form") as HTMLFormElement;
  if (form.dataset.editIdx) {
    // Edit
    const idx = Number(form.dataset.editIdx);
    const prize = state.prizes[idx];
    prize.name = name;
    prize.initialProbability = initialProbability;
    prize.initialHitCount = initialHitCount;
    // Also update current probability/hitCount if needed
    prize.probability = initialProbability;
    prize.hitCount = initialHitCount;
    // Optionally update prizesState if you want edits to reset hit counts
    state.prizesState[prize.id] = initialHitCount;
    delete form.dataset.editIdx;
  } else {
    // Add
    const newPrize = {
      id: "p_" + Date.now(),
      name,
      initialProbability,
      initialHitCount,
      probability: initialProbability,
      hitCount: initialHitCount,
    };
    state.prizes.push(newPrize);
    state.prizesState[newPrize.id] = newPrize.initialHitCount;
  }
  saveState(state);
  renderPrizeTable();
  closePrizeModal();
}

function handlePrizeTableClick(e: Event) {
  const target = e.target as HTMLElement;
  const state = getAppState();
  if (target.classList.contains("edit-prize-btn")) {
    const idx = Number(target.dataset.idx);
    showPrizeModal(idx);
  } else if (target.classList.contains("delete-prize-btn")) {
    const idx = Number(target.dataset.idx);
    // Remove prize from state
    state.prizes.splice(idx, 1);
    // Remove from prizesState
    // (prizesState might have keys not in prizes, that's ok)
    saveState(state);
    renderPrizeTable();
  }
}

// --- Participant Management ---
function loadParticipants(): Participant[] {
  const state = loadState();
  return state && state.participants ? state.participants : [];
}

function saveParticipants(participants: Participant[]) {
  const state = loadState();
  if (!state) return;
  state.participants = participants;
  // Keep bowl in sync with all participant ids
  state.bowl = participants.map((p) => p.id);
  saveState(state);
}

function renderParticipantsTable() {
  const tbody = document.querySelector<HTMLTableSectionElement>(
    "#participants-table tbody"
  );
  if (!tbody) return;
  tbody.innerHTML = "";
  const participants = loadParticipants();
  const state = loadState();
  const prizeMap = state && state.prizes ? Object.fromEntries(state.prizes.map(p => [p.id, p.name])) : {};
  participants.forEach((p, idx) => {
    const prizeName = p.assignedPrizeId ? (prizeMap[p.assignedPrizeId] || p.assignedPrizeId) : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${prizeName}</td>
      <td>
        <button class="edit-participant-btn" data-idx="${idx}">編輯</button>
        <button class="delete-participant-btn" data-idx="${idx}">刪除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populatePrizeDropdown(selectedPrizeId?: string) {
  const prizeInput = document.getElementById("participant-prize") as HTMLSelectElement;
  if (!prizeInput) return;
  const state = loadState();
  prizeInput.innerHTML = '<option value="">（未指派）</option>';
  if (state && state.prizes) {
    state.prizes.forEach(prize => {
      const option = document.createElement('option');
      option.value = prize.id;
      option.textContent = prize.name;
      if (selectedPrizeId && selectedPrizeId === prize.id) option.selected = true;
      prizeInput.appendChild(option);
    });
  }
}

function showParticipantModal(editIdx?: number) {
  const modal = document.getElementById("participant-modal");
  const form = document.getElementById("participant-form") as HTMLFormElement;
  const nameInput = document.getElementById(
    "participant-name"
  ) as HTMLInputElement;
  const prizeInput = document.getElementById(
    "participant-prize"
  ) as HTMLSelectElement;
  const title = document.getElementById("participant-modal-title");
  const overlay = document.getElementById("overlay");
  if (!modal || !form || !nameInput || !prizeInput || !title || !overlay) return;
  const participants = loadParticipants();
  if (typeof editIdx === "number") {
    // Edit mode
    nameInput.value = participants[editIdx].name;
    populatePrizeDropdown(participants[editIdx].assignedPrizeId);
    title.textContent = "編輯參與者";
    form.dataset.editIdx = String(editIdx);
  } else {
    // Add mode
    nameInput.value = "";
    populatePrizeDropdown();
    title.textContent = "新增參與者";
    delete form.dataset.editIdx;
  }
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function hideParticipantModal() {
  const modal = document.getElementById("participant-modal");
  const overlay = document.getElementById("overlay");
  if (modal) modal.classList.add("hidden");
  if (overlay) overlay.classList.add("hidden");
}

function handleAddParticipantClick() {
  showParticipantModal();
}

function handleParticipantFormSubmit(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const nameInput = document.getElementById(
    "participant-name"
  ) as HTMLInputElement;
  const prizeInput = document.getElementById(
    "participant-prize"
  ) as HTMLSelectElement;
  const name = nameInput.value.trim();
  const assignedPrizeId = prizeInput.value.trim() || undefined;
  if (!name) return;
  let participants = loadParticipants();
  if (form.dataset.editIdx) {
    // Edit
    const idx = Number(form.dataset.editIdx);
    participants[idx] = { ...participants[idx], name, assignedPrizeId };
  } else {
    // Add
    const id = `p_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    participants.push({ id, name, assignedPrizeId });
  }
  saveParticipants(participants);
  renderParticipantsTable();
  hideParticipantModal();
}

function handleParticipantTableClick(e: Event) {
  const target = e.target as HTMLElement;
  let participants = loadParticipants();
  if (target.classList.contains("edit-participant-btn")) {
    const idx = Number(target.dataset.idx);
    showParticipantModal(idx);
  } else if (target.classList.contains("delete-participant-btn")) {
    const idx = Number(target.dataset.idx);
    participants.splice(idx, 1);
    saveParticipants(participants);
    renderParticipantsTable();
  }
}

function setupParticipantHandlers() {
  document
    .getElementById("add-participant-btn")
    ?.addEventListener("click", handleAddParticipantClick);
  document
    .getElementById("participant-form")
    ?.addEventListener("submit", handleParticipantFormSubmit);
  document
    .querySelector("#participants-table tbody")
    ?.addEventListener("click", handleParticipantTableClick);
  // Modal close logic (if you have a close button or click outside)
  document
    .querySelectorAll("#cancel-participant-btn")
    .forEach((btn) => btn.addEventListener("click", hideParticipantModal));
  // Hide participant modal when clicking overlay
  document.getElementById("overlay")?.addEventListener("click", hideParticipantModal);
}

document.addEventListener("DOMContentLoaded", () => {
  renderPrizeTable();
  (document.getElementById("add-prize-btn") as HTMLButtonElement).onclick =
    () => showPrizeModal();
  (document.getElementById("cancel-prize-btn") as HTMLButtonElement).onclick =
    closePrizeModal;
  (document.getElementById("prize-form") as HTMLFormElement).onsubmit =
    handleAddPrize;
  (document.getElementById("overlay") as HTMLElement).onclick = closePrizeModal;
  document.querySelector("#prizes-table tbody")?.addEventListener("click", handlePrizeTableClick);
  renderParticipantsTable();
  setupParticipantHandlers();
});
