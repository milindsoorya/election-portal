export const ALLIANCE_COLORS: Record<string, string> = {
  LDF: "#e63946",
  UDF: "#0077b6",
  NDA: "#f77f00",
  Others: "#6c757d",
};

export const STATE_CODES: Record<string, string> = {
  kerala: "S21",
  tamilnadu: "S33",
  westbengal: "S20",
  assam: "S03",
  up: "S09",
};

/** ECI constituency number ranges per state (for validation) */
export const STATE_AC_RANGE: Record<string, [number, number]> = {
  kerala: [1, 140],
  tamilnadu: [1, 234],
  westbengal: [1, 294],
};
