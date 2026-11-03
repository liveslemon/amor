import { useEffect } from "react";
import { useRouter } from "next/router";

// The dates experience lives on /date; keep old links and bookmarks working.
export default function DatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/date");
  }, [router]);

  return null;
}
