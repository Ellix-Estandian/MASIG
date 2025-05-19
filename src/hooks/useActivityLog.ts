
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export type ActivityAction = "added" | "edited" | "deleted" | "viewed";

interface ActivityLogParams {
  action: ActivityAction;
  productCode?: string;
  productName?: string;
  details?: Record<string, any>;
}

export const useActivityLog = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const logActivity = useCallback(
    async ({ action, productCode, productName, details }: ActivityLogParams) => {
      if (!user) return;

      try {
        const { error } = await supabase.from("activity_logs").insert({
          user_id: user.id,
          user_email: user.email || "unknown@email.com",
          action_type: action,
          product_code: productCode,
          product_name: productName,
          details: details || null,
        });

        if (error) {
          console.error("Error logging activity:", error);
          toast({
            variant: "destructive",
            title: "Error logging activity",
            description: "The action was completed but could not be logged.",
          });
        }
      } catch (err) {
        console.error("Exception logging activity:", err);
      }
    },
    [user, toast]
  );

  return { logActivity };
};
