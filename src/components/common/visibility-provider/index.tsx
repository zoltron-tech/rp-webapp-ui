import { type FC, useEffect } from "react";
import { VisibilityContext } from "@/context";
import { useStateMachine } from "@/hooks/use-state-machine";
import { Logger } from "@/utils/services";

export interface VisibilityProviderProps {
  name: string;
  children: React.ReactNode;
  visible?: boolean;
}

export const VisibilityProvider: FC<VisibilityProviderProps> = ({
  name,
  children,
  visible = false,
}) => {
  const { state, transition } = useStateMachine<"VISIBLE" | "HIDDEN">({
    initial: visible ? "VISIBLE" : "HIDDEN",
    transitions: {
      VISIBLE: {
        HIDDEN: true,
      },
      HIDDEN: {
        VISIBLE: true,
      },
    },
  });

  const onCloseEvent = () => {
    Logger.debug("onCloseEvent", name);
    transition("HIDDEN");
  };

  const onOpenEvent = () => {
    Logger.debug("onOpenEvent", name);
    transition("VISIBLE");
  };

  const onToggleEvent = () => {
    Logger.debug("onToggleEvent", name);
    toggleVisibility();
  };

  const toggleVisibility = () => {
    switch (state) {
      case "VISIBLE":
        transition("HIDDEN");
        return;
      case "HIDDEN":
        transition("VISIBLE");
    }
  };

  useEffect(() => {
    window.addEventListener(`visibility-provider:open:${name}`, onOpenEvent);
    window.addEventListener(`visibility-provider:close:${name}`, onCloseEvent);
    window.addEventListener(
      `visibility-provider:toggle:${name}`,
      onToggleEvent,
    );

    return () => {
      window.removeEventListener(
        `visibility-provider:open:${name}`,
        onOpenEvent,
      );
      window.removeEventListener(
        `visibility-provider:close:${name}`,
        onCloseEvent,
      );
      window.removeEventListener(
        `visibility-provider:toggle:${name}`,
        onToggleEvent,
      );
    };
  }, []);

  return (
    <VisibilityContext.Provider
      value={{
        name,
        isVisible: state === "VISIBLE",
        toggleVisibility,
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
};

export * from "./content";
export * from "./trigger";
