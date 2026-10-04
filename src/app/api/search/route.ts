import { NextResponse } from "next/server";
import { loadCommunity } from "@/lib/ens";
import { retrieveProfiles } from "@/lib/retrieval";
import { rankAndExplain } from "@/lib/llm";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (typeof query !== "string" || !query.trim()) return NextResponse.json({error:"Ask a question."},{status:400});

    const profiles = await loadCommunity();
    const candidates = retrieveProfiles(query, profiles);

    // Explicit no-match branch: do not send an empty candidate set to the model.
    if (candidates.length === 0) {
      return NextResponse.json({matches:[], noMatch:"Nobody in this community matches the request."});
    }

    const rawMatches = await rankAndExplain(query, candidates);

    // Critical grounding check: model names must belong to retrieved candidates.
    const candidateByName = new Map(candidates.map(p => [p.name.toLowerCase(), p]));
    const matches = rawMatches
      .map((m: {name?:string; reason?:string}) => {
        const candidate = typeof m.name === "string" ? candidateByName.get(m.name.toLowerCase()) : undefined;
        return candidate ? {name:candidate.name, reason:typeof m.reason === "string" ? m.reason : "Matches the retrieved profile."} : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      matches,
      candidateCount: candidates.length,
      indexedCount: profiles.length
    });
  } catch (error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Search failed."},{status:500});
  }
}
