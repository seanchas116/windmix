import { useEffect } from "react";
import { appState } from "../../../state/AppState";

export function useOnSelectionChange(effect: () => void): void {
  const ids = appState.document.selectedElements
    .map((element) => element.id)
    .join();

  useEffect(() => {
    effect();
  }, [ids]);
}
