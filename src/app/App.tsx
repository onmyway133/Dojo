import { RouterProvider } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "./router";
import { useApplyTheme, useResolvedTheme } from "./useTheme";
import { useUpdateCheck } from "./useUpdateCheck";

export function App() {
  useApplyTheme();
  useUpdateCheck();
  const theme = useResolvedTheme();

  return (
    <TooltipProvider delayDuration={500}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" theme={theme} />
    </TooltipProvider>
  );
}
