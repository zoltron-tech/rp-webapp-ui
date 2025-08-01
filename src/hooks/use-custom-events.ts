export const useCustomEvents = (prefix: string, uniqifier?: string) => {
  const uniquePrefix = uniqifier ? `${prefix}-${uniqifier}` : prefix;
  const getEventName = (name: string) => `${uniquePrefix}:${name}`;

  return {
    getEventName,
    on: (name: string, callback: (event: CustomEvent) => void) => {
      window.addEventListener(
        getEventName(name),
        callback as EventListener,
        false
      );
    },
    off: (name: string, callback: (event: CustomEvent) => void) => {
      window.removeEventListener(getEventName(name), callback as EventListener);
    },
    emit: (name: string, detail?: any) => {
      const event = new CustomEvent(getEventName(name), { detail });
      window.dispatchEvent(event);
    },
  };
};
