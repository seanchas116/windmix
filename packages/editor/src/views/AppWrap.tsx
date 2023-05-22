import { PaintkitRoot } from "@seanchas116/paintkit/src/components/PaintkitRoot";

export const AppWrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PaintkitRoot
      colorScheme="auto"
      darkSelector="body.vscode-dark"
      lightSelector="body.vscode-light"
    >
      <div
        className="
    fixed inset-0 w-screen h-screen text-xs
    "
      >
        {children}
      </div>
    </PaintkitRoot>
  );
};
