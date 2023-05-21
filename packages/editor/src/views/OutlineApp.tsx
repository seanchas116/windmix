import { observer } from "mobx-react-lite";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { Outline } from "./outline/Outline";

export const OutlineApp: React.FC = observer(() => {
  return (
    <PaintkitRoot colorScheme="dark">
      <div className="fixed inset-0 w-screen h-screen">
        <Outline className="w-full h-full" />
      </div>
    </PaintkitRoot>
  );
});
