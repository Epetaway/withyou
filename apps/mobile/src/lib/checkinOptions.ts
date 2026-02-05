/**
 * Check-in options with labels, descriptions, and icon mappings
 */

export type CheckInOptionId = string;

export type CheckInSection = "needs" | "intentions" | "support";

export interface CheckInOption {
  id: CheckInOptionId;
  label: string;
  iconName: string;
  section: CheckInSection;
  description?: string;
}

export const checkInOptions: Record<CheckInOptionId, CheckInOption> = {
  // I could really use... (needs)
  empathy: {
    id: "empathy",
    label: "Empathy",
    iconName: "heart-outline",
    section: "needs",
    description: "I need to feel heard and understood.",
  },
  reassurance: {
    id: "reassurance",
    label: "Reassurance",
    iconName: "checkmark-circle-outline",
    section: "needs",
    description: "I need support and comfort.",
  },

  // I need to... (intentions)
  recharge: {
    id: "recharge",
    label: "Recharge",
    iconName: "battery-charging-outline",
    section: "intentions",
  },
  feel_close: {
    id: "feel_close",
    label: "Feel close",
    iconName: "people-outline",
    section: "intentions",
  },
  encouragement: {
    id: "encouragement",
    label: "Encouragement",
    iconName: "star-outline",
    section: "intentions",
  },

  // Ways you can help... (support)
  listen: {
    id: "listen",
    label: "Listen to me",
    iconName: "ear-outline",
    section: "support",
  },
  advice: {
    id: "advice",
    label: "Give me advice",
    iconName: "bulb-outline",
    section: "support",
  },
  give_hand: {
    id: "give_hand",
    label: "Give me a hand",
    iconName: "hand-left-outline",
    section: "support",
  },
};

/**
 * Get options for a specific section
 */
export function getOptionsForSection(section: CheckInSection): CheckInOption[] {
  return Object.values(checkInOptions).filter((opt) => opt.section === section);
}

/**
 * Get label for a mood level (1-5)
 */
export function getMoodLevelLabel(level: 1 | 2 | 3 | 4 | 5 | null): string {
  if (!level) return "Not set";
  const labels = {
    1: "Struggling",
    2: "Difficult",
    3: "Okay",
    4: "Good",
    5: "Great",
  };
  return labels[level];
}
