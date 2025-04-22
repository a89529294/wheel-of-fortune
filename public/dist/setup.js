"use strict";
(() => {
  // src/storage.ts
  var STORAGE_KEY = "wof_app_state_v1";
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // src/setup.ts
  function getAppState() {
    const state = loadState();
    if (state) return state;
    const initState = {
      prizes: [],
      participants: [],
      bowl: [],
      prizesState: {},
      log: [],
      spinNumber: 1
    };
    saveState(initState);
    return initState;
  }
  function renderPrizeTable() {
    const state = getAppState();
    const prizes = state.prizes;
    const tbody = document.querySelector(
      "#prizes-table tbody"
    );
    tbody.innerHTML = "";
    prizes.forEach((prize, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${prize.name}</td>
      <td>${prize.initialProbability}</td>
      <td>${prize.initialHitCount}</td>
      <td>
        <button class="edit-prize-btn" data-idx="${idx}">\u7DE8\u8F2F</button>
        <button class="delete-prize-btn" data-idx="${idx}">\u522A\u9664</button>
      </td>
    `;
      tbody.appendChild(tr);
    });
  }
  function closePrizeModal() {
    document.getElementById("prize-modal").classList.add(
      "hidden"
    );
    document.getElementById("overlay").classList.add("hidden");
  }
  function showPrizeModal(editIdx) {
    const modal = document.getElementById("prize-modal");
    const form = document.getElementById("prize-form");
    const nameInput = document.getElementById("prize-name");
    const probInput = document.getElementById("prize-probability");
    const hitInput = document.getElementById("prize-hitcount");
    const title = document.getElementById("prize-modal-title");
    const overlay = document.getElementById("overlay");
    if (!modal || !form || !nameInput || !probInput || !hitInput || !title || !overlay) return;
    const state = getAppState();
    if (typeof editIdx === "number") {
      const prize = state.prizes[editIdx];
      nameInput.value = prize.name;
      probInput.value = String(prize.initialProbability);
      hitInput.value = String(prize.initialHitCount);
      title.textContent = "\u7DE8\u8F2F\u734E\u9805";
      form.dataset.editIdx = String(editIdx);
    } else {
      nameInput.value = "";
      probInput.value = "";
      hitInput.value = "";
      title.textContent = "\u65B0\u589E\u734E\u9805";
      delete form.dataset.editIdx;
    }
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }
  function handleAddPrize(e) {
    e.preventDefault();
    const name = document.getElementById("prize-name").value.trim();
    const initialProbability = parseInt(
      document.getElementById("prize-probability").value,
      10
    );
    const initialHitCount = parseInt(
      document.getElementById("prize-hitcount").value,
      10
    );
    if (!name || isNaN(initialProbability) || isNaN(initialHitCount)) {
      alert("\u8ACB\u586B\u5BEB\u6240\u6709\u6B04\u4F4D");
      return;
    }
    const state = getAppState();
    const form = document.getElementById("prize-form");
    if (form.dataset.editIdx) {
      const idx = Number(form.dataset.editIdx);
      const prize = state.prizes[idx];
      prize.name = name;
      prize.initialProbability = initialProbability;
      prize.initialHitCount = initialHitCount;
      prize.probability = initialProbability;
      prize.hitCount = initialHitCount;
      state.prizesState[prize.id] = initialHitCount;
      delete form.dataset.editIdx;
    } else {
      const newPrize = {
        id: "p_" + Date.now(),
        name,
        initialProbability,
        initialHitCount,
        probability: initialProbability,
        hitCount: initialHitCount
      };
      state.prizes.push(newPrize);
      state.prizesState[newPrize.id] = newPrize.initialHitCount;
    }
    saveState(state);
    renderPrizeTable();
    closePrizeModal();
  }
  function handlePrizeTableClick(e) {
    const target = e.target;
    const state = getAppState();
    if (target.classList.contains("edit-prize-btn")) {
      const idx = Number(target.dataset.idx);
      showPrizeModal(idx);
    } else if (target.classList.contains("delete-prize-btn")) {
      const idx = Number(target.dataset.idx);
      state.prizes.splice(idx, 1);
      saveState(state);
      renderPrizeTable();
    }
  }
  function loadParticipants() {
    const state = loadState();
    return state && state.participants ? state.participants : [];
  }
  function saveParticipants(participants) {
    const state = loadState();
    if (!state) return;
    state.participants = participants;
    state.bowl = participants.map((p) => p.id);
    saveState(state);
  }
  function renderParticipantsTable() {
    const tbody = document.querySelector(
      "#participants-table tbody"
    );
    if (!tbody) return;
    tbody.innerHTML = "";
    const participants = loadParticipants();
    const state = loadState();
    const prizeMap = state && state.prizes ? Object.fromEntries(state.prizes.map((p) => [p.id, p.name])) : {};
    participants.forEach((p, idx) => {
      const prizeName = p.assignedPrizeId ? prizeMap[p.assignedPrizeId] || p.assignedPrizeId : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${p.name}</td>
      <td>${prizeName}</td>
      <td>
        <button class="edit-participant-btn" data-idx="${idx}">\u7DE8\u8F2F</button>
        <button class="delete-participant-btn" data-idx="${idx}">\u522A\u9664</button>
      </td>
    `;
      tbody.appendChild(tr);
    });
  }
  function populatePrizeDropdown(selectedPrizeId) {
    const prizeInput = document.getElementById("participant-prize");
    if (!prizeInput) return;
    const state = loadState();
    prizeInput.innerHTML = '<option value="">\uFF08\u672A\u6307\u6D3E\uFF09</option>';
    if (state && state.prizes) {
      state.prizes.forEach((prize) => {
        const option = document.createElement("option");
        option.value = prize.id;
        option.textContent = prize.name;
        if (selectedPrizeId && selectedPrizeId === prize.id) option.selected = true;
        prizeInput.appendChild(option);
      });
    }
  }
  function showParticipantModal(editIdx) {
    const modal = document.getElementById("participant-modal");
    const form = document.getElementById("participant-form");
    const nameInput = document.getElementById(
      "participant-name"
    );
    const prizeInput = document.getElementById(
      "participant-prize"
    );
    const title = document.getElementById("participant-modal-title");
    const overlay = document.getElementById("overlay");
    if (!modal || !form || !nameInput || !prizeInput || !title || !overlay) return;
    const participants = loadParticipants();
    if (typeof editIdx === "number") {
      nameInput.value = participants[editIdx].name;
      populatePrizeDropdown(participants[editIdx].assignedPrizeId);
      title.textContent = "\u7DE8\u8F2F\u53C3\u8207\u8005";
      form.dataset.editIdx = String(editIdx);
    } else {
      nameInput.value = "";
      populatePrizeDropdown();
      title.textContent = "\u65B0\u589E\u53C3\u8207\u8005";
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
  function handleParticipantFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const nameInput = document.getElementById(
      "participant-name"
    );
    const prizeInput = document.getElementById(
      "participant-prize"
    );
    const name = nameInput.value.trim();
    const assignedPrizeId = prizeInput.value.trim() || void 0;
    if (!name) return;
    let participants = loadParticipants();
    if (form.dataset.editIdx) {
      const idx = Number(form.dataset.editIdx);
      participants[idx] = { ...participants[idx], name, assignedPrizeId };
    } else {
      const id = `p_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
      participants.push({ id, name, assignedPrizeId });
    }
    saveParticipants(participants);
    renderParticipantsTable();
    hideParticipantModal();
  }
  function handleParticipantTableClick(e) {
    const target = e.target;
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
    document.getElementById("add-participant-btn")?.addEventListener("click", handleAddParticipantClick);
    document.getElementById("participant-form")?.addEventListener("submit", handleParticipantFormSubmit);
    document.querySelector("#participants-table tbody")?.addEventListener("click", handleParticipantTableClick);
    document.querySelectorAll("#cancel-participant-btn").forEach((btn) => btn.addEventListener("click", hideParticipantModal));
    document.getElementById("overlay")?.addEventListener("click", hideParticipantModal);
  }
  document.addEventListener("DOMContentLoaded", () => {
    renderPrizeTable();
    document.getElementById("add-prize-btn").onclick = () => showPrizeModal();
    document.getElementById("cancel-prize-btn").onclick = closePrizeModal;
    document.getElementById("prize-form").onsubmit = handleAddPrize;
    document.getElementById("overlay").onclick = closePrizeModal;
    document.querySelector("#prizes-table tbody")?.addEventListener("click", handlePrizeTableClick);
    renderParticipantsTable();
    setupParticipantHandlers();
  });
})();
