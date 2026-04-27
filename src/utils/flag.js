export const countryFlag = (code) => {
  if (!code || code.length !== 2) return "🌍";
  const OFFSET = 0x1F1E6 - 65;
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + OFFSET))
    .join("");
};
