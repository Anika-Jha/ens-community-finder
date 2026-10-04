import { createPublicClient, http, normalize, namehash, type PublicClient } from "viem";
import { sepolia } from "viem/chains";
import { getEnsText } from "viem/ens";
import { Profile, ProfileSchema, PROFILE_KEYS } from "./profile";

const client: PublicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org"),
});

const SUBGRAPH = process.env.ENS_SUBGRAPH_URL || "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

async function discoverSubnames(parent: string): Promise<string[]> {
  const normalizedParent = normalize(parent);
  const parentHash = namehash(normalizedParent);
  const query = {
    query: `query($parent: Bytes!) {
      domains(where:{parent:$parent}) { name }
    }`,
    variables: { parent: parentHash },
  };
  const response = await fetch(SUBGRAPH, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(query),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not discover ENS community names.");
  const json = await response.json();
  return (json.data?.domains || []).map((x: {name:string}) => x.name).filter(Boolean);
}

export async function loadCommunity(): Promise<Profile[]> {
  const parent = process.env.COMMUNITY_PARENT;
  if (!parent) throw new Error("COMMUNITY_PARENT is not configured.");

  const names = await discoverSubnames(parent);
  const profiles: Profile[] = [];

  for (const rawName of names) {
    try {
      // Normalize before every ENS lookup.
      const name = normalize(rawName);
      const [bio, skills, availability] = await Promise.all([
        getEnsText(client, {name, key: PROFILE_KEYS.bio}),
        getEnsText(client, {name, key: PROFILE_KEYS.skills}),
        getEnsText(client, {name, key: PROFILE_KEYS.availability}),
      ]);
      const parsed = ProfileSchema.safeParse({
        bio: bio || "",
        skills: skills || "",
        availability: availability || "",
      });
      if (!parsed.success) continue;
      profiles.push({ name, ...parsed.data });
    } catch {
      // One malformed profile must not abort discovery of other members.
      continue;
    }
  }
  return profiles;
}
