import { useEffect } from "react";
import { toast } from "sonner";

const TOAST_ID = "network-offline";

export function useNetworkStatus() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      toast("You're offline — some features may not work", {
        id: TOAST_ID,
        duration: Infinity,
        icon: "📡",
      });
    };

    const handleOnline = () => {
      toast.dismiss(TOAST_ID);
      toast.success("Back online", { duration: 2000 });
    };

    if (!navigator.onLine) handleOffline();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      toast.dismiss(TOAST_ID);
    };
  }, []);
}
