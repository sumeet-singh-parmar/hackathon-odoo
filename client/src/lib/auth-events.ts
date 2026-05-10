type Listener = () => void;

const listeners = new Set<Listener>();

export const authEvents = {
  onSessionEnded(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  emitSessionEnded(): void {
    listeners.forEach((fn) => fn());
  },
};
