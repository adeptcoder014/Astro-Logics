export const parseNarrative = (text: string) => {
  if (!text) return [];
  return text
    .split("\n")
    .reduce((acc: any[], line: string) => {
      const cleanLine = line.replace(/\*\*|\*/g, "").replace(/^>\s*/, "").trim();
      if (cleanLine.startsWith("---") || ["[START_SCENE]", "[END_SCENE]"].includes(cleanLine)) return acc;

      if (cleanLine.includes("|")) {
        const [type, ...rest] = cleanLine.split("|");
        const label = type.trim().toUpperCase();
        const entry: any = { type: label };

        if (label === "DIALOGUE") {
          entry.character = rest[0]?.trim().toUpperCase();
          entry.text = rest[1]?.trim() || "";
        } else {
          entry.text = rest.join("|").trim();
        }
        acc.push(entry);
      } else if (acc.length > 0 && cleanLine.length > 0) {
        acc[acc.length - 1].text += "\n" + cleanLine;
      }
      return acc;
    }, [])
    .filter(Boolean);
};