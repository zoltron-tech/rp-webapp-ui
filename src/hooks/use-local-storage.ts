export const useLocalStorage = () => {
  const getItem = (key: string) => {
    if (!window.localStorage) return null;

    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  const setItem = (key: string, value: any) => {
    const valueToStore = JSON.stringify(value);
    if (!window.localStorage) return;

    window.localStorage.setItem(key, valueToStore);
  };

  return { getItem, setItem };
};
