import colors from "tailwindcss/colors";

export const dragStartThreshold = 4;
export const snapThreshold = 4;
export const commitDebounceInterval = 200;
export const doubleClickInterval = 300;

export const breakpoints = [
  {
    minWidth: 640,
    color: colors.red[400],
  },
  {
    minWidth: 1024,
    color: colors.green[400],
  },
];
