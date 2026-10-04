import type { Profile } from "./profile";

export const TOP_K = 5;

const STOP = new Set(["the","and","for","with","this","that","from","who","can","are","is","to","a","an","in","on","me","month"]);

function terms(text: string) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(x => x && !STOP.has(x));
}

export function retrieveProfiles(query: string, profiles: Profile[]): Profile[] {
  const q = terms(query);
  const scored = profiles.map(profile => {
    const haystack = `${profile.name} ${profile.bio} ${profile.skills} ${profile.availability}`.toLowerCase();
    let score = 0;
    for (const term of q) if (haystack.includes(term)) score += 1;
    if (q.some(t => t === "free" || t === "available") && profile.availability === "available") score += 4;
    if (q.some(t => t === "mentor" || t === "mentoring") && /mentor/i.test(haystack)) score += 4;
    return { profile, score };
  });
  return scored.filter(x => x.score > 0).sort((a,b)=>b.score-a.score).slice(0, TOP_K).map(x=>x.profile);
}
