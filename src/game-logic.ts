import { AppState, Prize } from './types';

// Helper to compute adjusted probabilities for an array of prizes
export function getAdjustedProbabilities(state: AppState, prizes: Prize[]): number[] {
  return prizes.map(
    (p) =>
      p.initialProbability *
      (state.prizesState[p.id] / p.initialHitCount)
  );
}

// Prize selection by adjusted probability
export function pickPrizeId(state: AppState): string {
  const prizes = state.prizes.filter((p) => state.prizesState[p.id] > 0);
  const adjusted = getAdjustedProbabilities(state, prizes);
  // Calculate reserved hits for each prize
  const reserved: { [prizeId: string]: number } = {};
  // Only count participants still in the bowl
  const bowlSet = new Set(state.bowl);
  for (const p of state.participants) {
    if (p.assignedPrizeId && bowlSet.has(p.id)) {
      reserved[p.assignedPrizeId] = (reserved[p.assignedPrizeId] || 0) + 1;
    }
  }
  // Try to pick a prize, but only if enough unreserved hits are left
  let attempts = 0;
  const maxAttempts = 100;
  while (attempts < maxAttempts) {
    let total = adjusted.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let chosenIdx = 0;
    for (let i = 0; i < prizes.length; ++i) {
      if (r < adjusted[i]) {
        chosenIdx = i;
        break;
      }
      r -= adjusted[i];
    }
    const prize = prizes[chosenIdx];
    const left = state.prizesState[prize.id];
    const reservedCount = reserved[prize.id] || 0;
    // Only allow if there is at least one hit not reserved for future pre-assigned spins
    if (left > reservedCount) {
      return prize.id;
    }
    attempts++;
  }
  // Fallback: pick first prize with available unreserved hits
  for (const prize of prizes) {
    const left = state.prizesState[prize.id];
    const reservedCount = reserved[prize.id] || 0;
    if (left > reservedCount) return prize.id;
  }
  // If all are reserved, just pick the first available (shouldn't happen)
  return prizes[0].id;
}

// Finalize a pending spin
export function finalizePendingSpin(state: AppState) {
  if (!state.pendingSpin) return;
  const { participantId, prizeId } = state.pendingSpin;
  const participant = state.participants.find((p) => p.id === participantId);
  const prize = state.prizes.find((p) => p.id === prizeId);
  if (!participant || !prize) {
    state.pendingSpin = undefined;
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
}

// Prize angle calculation for animation
export function getRotationForPrize(state: AppState, prize: Prize): number {
  const prizes = state.prizes.filter(
    (p) => state.prizesState[p.id] > 0 || p.id === prize.id
  );
  const adjusted = getAdjustedProbabilities(state, prizes);
  const totalProb = adjusted.reduce((sum, val) => sum + val, 0);
  let angles: { id: string; start: number; end: number }[] = [];
  let angle = -Math.PI / 2;
  for (let i = 0; i < prizes.length; ++i) {
    const slice = (adjusted[i] / totalProb) * 2 * Math.PI;
    angles.push({ id: prizes[i].id, start: angle, end: angle + slice });
    angle += slice;
  }
  const target = angles.find((a) => a.id === prize.id)!;
  const targetAngle = (target.start + target.end) / 2;
  return (Math.PI * 3) / 2 - targetAngle;
}
