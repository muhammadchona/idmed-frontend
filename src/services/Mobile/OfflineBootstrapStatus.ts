export type OfflineBootstrapStage =
  | 'reference_data'
  | 'patient_data'
  | 'session_hydration'
  | 'completed';

type OfflineBootstrapState = {
  status: 'in_progress' | 'completed' | 'failed';
  stage: OfflineBootstrapStage;
  clinicId: string;
  patientCount?: number;
  migratedFromPatientCount?: boolean;
  updatedAt: string;
  error?: string;
};

const STORAGE_PREFIX = 'idmed:offline-bootstrap:';

function storageKey(clinicId: string) {
  return `${STORAGE_PREFIX}${clinicId}`;
}

function saveState(state: OfflineBootstrapState) {
  localStorage.setItem(storageKey(state.clinicId), JSON.stringify(state));
  return state;
}

export function getOfflineBootstrapState(clinicId: string) {
  const value = localStorage.getItem(storageKey(clinicId));
  if (value === null) return null;

  try {
    return JSON.parse(value) as OfflineBootstrapState;
  } catch (error) {
    console.error('Invalid offline bootstrap state:', error);
    return null;
  }
}

export function shouldRunOfflineBootstrap(
  clinicId: string,
  patientCount: number
) {
  const state = getOfflineBootstrapState(clinicId);

  if (state !== null) {
    if (state.status !== 'completed') return true;

    // Reinitialize when a previously populated patient database was cleared.
    return Boolean(
      state.patientCount !== undefined &&
        state.patientCount > 0 &&
        patientCount <= 0
    );
  }

  if (patientCount <= 0) return true;

  // Backward compatibility for tablets initialized before checkpoints existed.
  saveState({
    status: 'completed',
    stage: 'completed',
    clinicId,
    patientCount,
    migratedFromPatientCount: true,
    updatedAt: new Date().toISOString(),
  });
  return false;
}

export function updateOfflineBootstrapStage(
  clinicId: string,
  stage: OfflineBootstrapStage
) {
  return saveState({
    status: 'in_progress',
    stage,
    clinicId,
    updatedAt: new Date().toISOString(),
  });
}

export function completeOfflineBootstrap(
  clinicId: string,
  patientCount: number
) {
  return saveState({
    status: 'completed',
    stage: 'completed',
    clinicId,
    patientCount,
    updatedAt: new Date().toISOString(),
  });
}

export function failOfflineBootstrap(
  clinicId: string,
  stage: OfflineBootstrapStage,
  error: unknown
) {
  return saveState({
    status: 'failed',
    stage,
    clinicId,
    updatedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
  });
}
