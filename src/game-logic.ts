import { AppState, Prize } from './types';

// Prize selection by probability
export function pickPrizeId(state: AppState): string {
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
  return (Math.PI * 3) / 2 - targetAngle;
}
