import { z } from "zod";

export const ProfileSchema = z.object({
  bio: z.string().max(1000),
  skills: z.string().max(500),
  availability: z.enum(["available", "busy", "unavailable"]),
});

export type Profile = z.infer<typeof ProfileSchema> & { name: string };

export const PROFILE_KEYS = {
  bio: "community.bio",
  skills: "community.skills",
  availability: "community.availability",
} as const;
