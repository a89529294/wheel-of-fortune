export interface Prize {
  id: string;
  name: string;
  probability: number;
  hitCount: number;
  initialProbability: number;
  initialHitCount: number;
}

export interface Participant {
  id: string;
  name: string;
  assignedPrizeId?: string;
}

export interface SpinLogEntry {
  spin: number;
  participant: string;
  prize: string;
}

export interface AppState {
  prizes: Prize[];
  participants: Participant[];
  bowl: string[];
  prizesState: { [id: string]: number };
  log: SpinLogEntry[];
  spinNumber: number;
  drawnParticipantId?: string;
  pendingSpin?: { participantId: string; prizeId: string };
}
