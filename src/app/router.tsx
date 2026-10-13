import { createHashRouter } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/features/home/HomePage";
import { NotFound } from "@/features/tool/NotFound";
import { ToolRoute } from "@/features/tool/ToolRoute";

export const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "tools/:toolId", element: <ToolRoute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
