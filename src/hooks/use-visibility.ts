export interface UseVisibilityReturnType {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export const useVisibility = (name: string): UseVisibilityReturnType => {
  const show = () => {
    window.dispatchEvent(new CustomEvent(`visibility-provider:open:${name}`));
  };

  const hide = () => {
    window.dispatchEvent(new CustomEvent(`visibility-provider:close:${name}`));
  };

  const toggle = () => {
    window.dispatchEvent(new CustomEvent(`visibility-provider:toggle:${name}`));
  };

  return { show, hide, toggle };
};
