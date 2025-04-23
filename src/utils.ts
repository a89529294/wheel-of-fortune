import { Participant } from "./types";

export function getTotalInitialProbability(
  prizes: { initialProbability: number }[]
): number {
  return prizes.reduce(
    (sum, prize) => sum + (Number(prize.initialProbability) || 0),
    0
  );
}

// Returns true if the total is 100 (with a small tolerance for floating point errors)
export function isTotalProbabilityValid(
  prizes: { initialProbability: number }[],
  target = 100,
  epsilon = 0.001
): boolean {
  const total = getTotalInitialProbability(prizes);
  return Math.abs(total - target) < epsilon;
}

// Returns true if adding newProb to the current prizes does not exceed 100Yes
export function canAddPrizeProbability(
  prizes: { initialProbability: number }[],
  newProb: number,
  target = 100,
  epsilon = 0.001
): boolean {
  const total = getTotalInitialProbability(prizes);
  return total + newProb <= target + epsilon;
}

export function updateCurrentTotalProbability(total: number) {
  const el = document.getElementById("current-total-probability");
  if (el) {
    el.textContent = `(當前總機率: ${total}% )`;
  }
}

export function isPrizeModalReady(
  name: string,
  newInitProb: number,
  currentTotalProb: number,
  hitCount: number
): boolean {
  // 1. Name must be non-empty after trimming
  if (typeof name !== "string" || name.trim().length === 0) return false;
  // 2. newInitProb + currentTotalProb must be <= 100
  if (
    isNaN(newInitProb) ||
    isNaN(currentTotalProb) ||
    newInitProb < 0 ||
    currentTotalProb < 0
  )
    return false;
  if (newInitProb + currentTotalProb > 100) return false;
  // 3. hitCount must be > 0
  if (Number.isNaN(hitCount) || typeof hitCount !== "number" || hitCount <= 0)
    return false;
  console.log(hitCount);
  return true;
}

/**
 * Checks if the game is ready to be played.
 * @param prizes Array of prize objects with `initialProbability` property (number)
 * @param participants Array of Participant objects
 * @returns { ready: boolean, probOk: boolean, hasParticipants: boolean }
 */
export function checkGameReady(prizes: { initialProbability: number }[], participants: Participant[]) {
  const probOk = isTotalProbabilityValid(prizes);
  const hasParticipants = participants.length > 0;
  return {
    ready: probOk && hasParticipants,
    probOk,
    hasParticipants,
  };
}
