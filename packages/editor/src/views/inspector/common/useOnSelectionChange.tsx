import { useEffect } from "react";
import { appState } from "../../../state/AppState";

export function useOnSelectionChange(effect: () => void): void {
  const styles = appState.tailwindStyles;
  const styleIDs = styles.map((style) => style.node.id).join();

  useEffect(() => {
    effect();
  }, [styleIDs]);
}
