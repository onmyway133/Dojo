import { RouterProvider } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "./router";
import { useApplyTheme, useResolvedTheme } from "./useTheme";

export function App() {
  useApplyTheme();
  const theme = useResolvedTheme();

  return (
    <TooltipProvider delayDuration={500}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" theme={theme} />
    </TooltipProvider>
  );
}
