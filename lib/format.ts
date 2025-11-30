export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export const formatSubjectDisplay = (raw: string | undefined | null): string => {
  if (!raw) return "";
  let s = String(raw).trim();
  // Remove common technical prefixes
  s = s.replace(/^sub[_\-\s]+/i, "");
  s = s.replace(/^subject[_\-\s]+/i, "");
  // Normalize separators
  s = s.replace(/[._\-]+/g, " ");
  s = s.replace(/\s+/g, " ");
  // If it looks like an id code (e.g., "psych_101"), try to keep alpha words first
  const parts = s.split(" ");
  const cleaned = parts
    .filter((p) => /[a-zA-Z]/.test(p))
    .join(" ")
    .trim();
  return toTitleCase(cleaned || s);
};

