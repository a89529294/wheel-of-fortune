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
  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // src/utils.ts
  function getTotalInitialProbability(prizes) {
    return prizes.reduce(
      (sum, prize) => sum + (Number(prize.initialProbability) || 0),
      0
    );
  }
  function canAddPrizeProbability(prizes, newProb, target = 100, epsilon = 1e-3) {
    const total = getTotalInitialProbability(prizes);
    return total + newProb <= target + epsilon;
  }
  function updateCurrentTotalProbability(total) {
    const el = document.getElementById("current-total-probability");
    if (el) {
      el.textContent = `(\u7576\u524D\u7E3D\u6A5F\u7387: ${total}% )`;
    }
  }
  function isPrizeModalReady(name, newInitProb, currentTotalProb, hitCount) {
    if (typeof name !== "string" || name.trim().length === 0) return false;
    if (isNaN(newInitProb) || isNaN(currentTotalProb) || newInitProb < 0 || currentTotalProb < 0)
      return false;
    if (newInitProb + currentTotalProb > 100) return false;
    if (Number.isNaN(hitCount) || typeof hitCount !== "number" || hitCount <= 0)
      return false;
    console.log(hitCount);
    return true;
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
    const probInput = document.getElementById(
      "prize-probability"
    );
    const hitInput = document.getElementById(
      "prize-hitcount"
    );
    const title = document.getElementById("prize-modal-title");
    const overlay = document.getElementById("overlay");
    if (!modal || !form || !nameInput || !probInput || !hitInput || !title || !overlay)
      return;
    form.querySelector("button[type='submit']").disabled = true;
    const state = getAppState();
    let editMode = false;
    let editingIdx = -1;
    if (typeof editIdx === "number") {
      const prize = state.prizes[editIdx];
      nameInput.value = prize.name;
      probInput.value = String(prize.initialProbability);
      hitInput.value = String(prize.initialHitCount);
      title.textContent = "\u7DE8\u8F2F\u734E\u9805";
      form.dataset.editIdx = String(editIdx);
      editMode = true;
      editingIdx = editIdx;
    } else {
      nameInput.value = "";
      probInput.value = "";
      hitInput.value = "";
      title.textContent = "\u65B0\u589E\u734E\u9805";
      delete form.dataset.editIdx;
    }
    function updatePrizeModalSubmitState() {
      const name = nameInput.value;
      const prob = parseFloat(probInput.value);
      const hit = parseInt(hitInput.value, 10);
      let prizes = state.prizes;
      let currentTotal = 0;
      if (editMode && editingIdx !== -1) {
        prizes = state.prizes.slice();
        prizes[editingIdx] = { ...prizes[editingIdx], initialProbability: 0 };
        currentTotal = getTotalInitialProbability(prizes);
      } else {
        currentTotal = getTotalInitialProbability(prizes);
      }
      const ready = isPrizeModalReady(name, prob, currentTotal, hit);
      form.querySelector("button[type='submit']").disabled = !ready;
      const warningSpan = document.getElementById("prize-probability-warning");
      if (warningSpan) {
        const sum = (isNaN(prob) ? 0 : prob) + (isNaN(currentTotal) ? 0 : currentTotal);
        if (probInput.value && sum > 100) {
          warningSpan.textContent = `(\u7576\u524D\u7E3D\u6A5F\u7387\u52A0\u4E0A\u65B0\u6A5F\u7387\u70BA${sum}%)`;
          warningSpan.style.color = "red";
        } else {
          warningSpan.textContent = "";
          warningSpan.style.color = "";
        }
      }
    }
    nameInput.oninput = updatePrizeModalSubmitState;
    probInput.oninput = updatePrizeModalSubmitState;
    hitInput.oninput = updatePrizeModalSubmitState;
    updatePrizeModalSubmitState();
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
    let prizes = state.prizes.slice();
    if (form.dataset.editIdx) {
      const idx = Number(form.dataset.editIdx);
      prizes[idx] = { ...prizes[idx], initialProbability: 0 };
    }
    const canAdd = canAddPrizeProbability(prizes, initialProbability);
    const newTotal = getTotalInitialProbability(prizes) + initialProbability;
    if (!canAdd) {
      alert("Total probability exceeds 100%");
      return;
    }
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
    updateCurrentTotalProbability(getTotalInitialProbability(state.prizes));
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
      updateCurrentTotalProbability(getTotalInitialProbability(state.prizes));
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
    const prizeInput = document.getElementById(
      "participant-prize"
    );
    if (!prizeInput) return;
    const state = loadState();
    prizeInput.innerHTML = '<option value="">\uFF08\u672A\u6307\u6D3E\uFF09</option>';
    if (state && state.prizes) {
      state.prizes.forEach((prize) => {
        const option = document.createElement("option");
        option.value = prize.id;
        option.textContent = prize.name;
        if (selectedPrizeId && selectedPrizeId === prize.id)
          option.selected = true;
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
    if (!modal || !form || !nameInput || !prizeInput || !title || !overlay)
      return;
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
  function handleResetAll() {
    if (confirm(
      "\u78BA\u5B9A\u8981\u91CD\u7F6E\u6240\u6709\u8CC7\u6599\u55CE\uFF1F\u9019\u5C07\u6703\u6E05\u9664\u6240\u6709\u734E\u9805\u3001\u53C3\u8207\u8005\u53CA\u7D00\u9304\u3002"
    )) {
      clearState();
      renderPrizeTable();
      renderParticipantsTable();
      updateCurrentTotalProbability(0);
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    renderPrizeTable();
    const state = getAppState();
    const total = getTotalInitialProbability(state.prizes);
    updateCurrentTotalProbability(total);
    document.getElementById("add-prize-btn").onclick = () => showPrizeModal();
    document.getElementById("cancel-prize-btn").onclick = closePrizeModal;
    document.getElementById("prize-form").onsubmit = handleAddPrize;
    document.getElementById("overlay").onclick = closePrizeModal;
    document.querySelector("#prizes-table tbody")?.addEventListener("click", handlePrizeTableClick);
    renderParticipantsTable();
    setupParticipantHandlers();
    document.getElementById("reset-all-btn").onclick = handleResetAll;
  });
})();
