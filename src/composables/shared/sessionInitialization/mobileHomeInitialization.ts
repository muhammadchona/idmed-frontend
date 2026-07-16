type InitializationTask = () => Promise<unknown> | unknown;

let onlineInitialization: Promise<unknown> | null = null;
let offlineInitialization: Promise<unknown> | null = null;

function runOnce(
  currentInitialization: Promise<unknown> | null,
  setInitialization: (initialization: Promise<unknown> | null) => void,
  task: InitializationTask
) {
  if (currentInitialization !== null) return currentInitialization;

  const initialization = Promise.resolve()
    .then(task)
    .catch((error) => {
      // Permit a retry during the same session when initialization genuinely fails.
      setInitialization(null);
      throw error;
    });

  setInitialization(initialization);
  return initialization;
}

export function initializeMobileOnlineHomeOnce(task: InitializationTask) {
  return runOnce(
    onlineInitialization,
    (initialization) => {
      onlineInitialization = initialization;
    },
    task
  );
}

export function initializeMobileOfflineHomeOnce(task: InitializationTask) {
  return runOnce(
    offlineInitialization,
    (initialization) => {
      offlineInitialization = initialization;
    },
    task
  );
}
