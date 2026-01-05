export class StorageService {
  static STORAGE_KEY = "taskBoardState";

  saveState(state) {
    localStorage.setItem(StorageService.STORAGE_KEY, JSON.stringify(state));
  }

  loadState(defaultState) {
    const saved = localStorage.getItem(StorageService.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn("Invalid localStorage state, resetting:", error);
      }
    }
    return defaultState;
  }
}
