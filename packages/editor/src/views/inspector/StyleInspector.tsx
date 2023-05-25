import { observer } from "mobx-react-lite";
import { LayoutPane } from "./LayoutPane";
import { TextPane } from "./TextPane";
import { DimensionPane } from "./DimensionPane";
import { BackgroundPane } from "./BackgroundPane";
import { RingPane } from "./RingPane";
import { DebugPane } from "./DebugPane";

export const StyleInspector: React.FC = observer(() => {
  return (
    <>
      <DimensionPane />
      <LayoutPane />
      <TextPane />
      <BackgroundPane />
      <RingPane />
      <DebugPane />
    </>
  );
});
