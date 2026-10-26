/**
 * Cleans raw markdown tables, pipe characters, asterisks, and special characters
 * into clean, natural language sentences and bullet items suitable for farmer reading and TTS voice speech.
 */
export const cleanSpeechAndText = (text: string): string => {
  if (!text) return "";

  const lines = text.split("\n");
  const cleaned: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // 1. Skip table divider lines like |---|---| or |:---:|
    if (/^\|?[\s\-:]+(\|[\s\-:]+)+\|?$/.test(trimmed)) {
      continue;
    }

    // 2. Convert markdown table rows with pipes into clean natural sentences
    if (trimmed.includes("|")) {
      const parts = trimmed
        .split("|")
        .map((p) => p.replace(/[\*#`_~]/g, "").trim())
        .filter(Boolean);

      if (parts.length === 1) {
        cleaned.push(parts[0]);
      } else if (parts.length === 2) {
        cleaned.push(`${parts[0]}: ${parts[1]}`);
      } else if (parts.length >= 3) {
        const title = parts[0];
        const rest = parts.slice(1).join(" — ");
        cleaned.push(`${title}: ${rest}`);
      }
      continue;
    }

    // 3. Remove asterisks (** or *), markdown headers (###), backticks, tildes, remaining pipes
    let cleanLine = line
      .replace(/\*+/g, "")
      .replace(/^#+\s*/, "")
      .replace(/[`|~]/g, "");

    cleaned.push(cleanLine);
  }

  // Normalize multiple consecutive blank lines
  return cleaned
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
