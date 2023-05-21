import { observer } from "mobx-react-lite";
import { StyleInspector } from "./inspector/StyleInspector";
import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";
import { ScrollArea } from "@seanchas116/paintkit/src/components/ScrollArea";

export const InspectorApp: React.FC = observer(() => {
  return (
    <PaintkitRoot colorScheme="dark">
      <div className="fixed inset-0 w-screen h-screen">
        <ScrollArea>
          <StyleInspector />
        </ScrollArea>
      </div>
    </PaintkitRoot>
  );
});
