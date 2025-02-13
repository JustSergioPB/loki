export const observationLevel = ["warn", "error"] as const;
export type ObservationLevel = (typeof observationLevel)[number];

export type Observation = {
  level: ObservationLevel;
  path: string;
  code: string;
};
