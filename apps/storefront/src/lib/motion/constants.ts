export const DURATION = {
  fast: 0.15,
  quick: 0.2,
  base: 0.3,
  slow: 0.45,
  cinematic: 0.65,
} as const;

export const EASE = {
  emphasised: [0.16, 1, 0.3, 1] as [number, number, number, number],
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
};
