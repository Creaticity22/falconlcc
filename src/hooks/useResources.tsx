import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export interface Resource {
  id: string;
  topic: string;
  title: string;
  description: string;
  source_name: string;
  url: string;
  age_min: number | null;
  age_max: number | null;
  is_video: boolean;
  created_at: string;
}

/** Parse the user's age_range (e.g. "15-17") into a rough numeric age for filtering. */
function ageFromRange(range: string | null | undefined): number | null {
  if (!range) return null;
  const match = range.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function useResources(topics: string[], limit = 3) {
  const { data: profile } = useProfile();
  const userAge = ageFromRange(profile?.age_range);

  return useQuery<Resource[]>({
    queryKey: ["resources", topics.join(","), userAge, limit],
    queryFn: async () => {
      // topics are stored lowercase in DB; lesson topics may be capitalised
      const lowerTopics = topics.map((t) => t.toLowerCase());

      let q = supabase
        .from("resources")
        .select("*")
        .in("topic", lowerTopics)
        .limit(limit);

      const { data, error } = await q;
      if (error) throw error;

      // Client-side age filter (simpler than building OR/NULL SQL)
      if (userAge != null) {
        return (data as Resource[]).filter((r) => {
          const minOk = r.age_min == null || userAge >= r.age_min;
          const maxOk = r.age_max == null || userAge <= r.age_max;
          return minOk && maxOk;
        });
      }
      return data as Resource[];
    },
    enabled: topics.length > 0,
  });
}
