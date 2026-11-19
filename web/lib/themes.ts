/**
 * themes.ts - the colour themes a visitor can pick.
 *
 * The real colour values live in app/globals.css (one block per theme).
 * This list is only used by the theme picker to show names and little swatches.
 */
export type Theme = {
  id: string; // must match [data-theme="..."] in globals.css
  name: string; // shown in the picker
  swatch: [string, string, string]; // main, accent, background - for the little dots
};

export const THEMES: Theme[] = [
  { id: "mocha", name: "Mocha", swatch: ["#8C6E5D", "#D9B99B", "#EFE8E2"] },
  { id: "green", name: "Bangladesh green", swatch: ["#006A4E", "#E8414F", "#E9F2EE"] },
  { id: "blue", name: "Police blue", swatch: ["#1E5AA8", "#F2A93B", "#EAF1F8"] },
  { id: "sage", name: "Sage", swatch: ["#5F8466", "#E3B66B", "#EDF2EB"] },
  { id: "terracotta", name: "Terracotta", swatch: ["#C2603E", "#2F5D62", "#F6ECE6"] },
  { id: "plum", name: "Royal plum", swatch: ["#6B4C9A", "#E7849B", "#F1ECF5"] },
  { id: "ocean", name: "Ocean teal", swatch: ["#137C7A", "#FF8A5B", "#E8F4F3"] },
  { id: "midnight", name: "Midnight", swatch: ["#7FA7FF", "#F5B85C", "#11151C"] },
  { id: "rose", name: "Rose blush", swatch: ["#B07A80", "#F0C9CB", "#F3E6E6"] },
  { id: "stone", name: "Nude stone", swatch: ["#2B2B2E", "#D8B8A3", "#E9E6E1"] },
  { id: "gold", name: "Charcoal gold", swatch: ["#D4AF6A", "#EAD7A8", "#161616"] },
  { id: "emerald", name: "Emerald night", swatch: ["#3CCF91", "#F2C14E", "#0F1B17"] },
];

export const DEFAULT_THEME = "sage";
