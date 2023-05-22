import { observer } from "mobx-react-lite";
import { StyleInspector } from "./inspector/StyleInspector";
import { ScrollArea } from "@seanchas116/paintkit/src/components/ScrollArea";
import { AppWrap } from "./AppWrap";

export const InspectorApp: React.FC = observer(() => {
  return (
    <AppWrap>
      <ScrollArea>
        <StyleInspector />
      </ScrollArea>
    </AppWrap>
  );
});
