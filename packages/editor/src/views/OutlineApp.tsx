import { observer } from "mobx-react-lite";
import { Outline } from "./outline/Outline";
import { AppWrap } from "./AppWrap";

export const OutlineApp: React.FC = observer(() => {
  return (
    <AppWrap>
      <Outline className="w-full h-full" />
    </AppWrap>
  );
});
