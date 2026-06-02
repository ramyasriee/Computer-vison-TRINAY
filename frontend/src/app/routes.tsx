import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { LiveCamera } from "./pages/LiveCamera";
import { ObjectDetection } from "./pages/ObjectDetection";
import { CurrencyDetection } from "./pages/CurrencyDetection";
import { TextReader } from "./pages/TextReader";
import { SceneSummary } from "./pages/SceneSummary";
import { SafetyMode } from "./pages/SafetyMode";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "live-camera", Component: LiveCamera },
      { path: "object-detection", Component: ObjectDetection },
      { path: "currency-detection", Component: CurrencyDetection },
      { path: "text-reader", Component: TextReader },
      { path: "scene-summary", Component: SceneSummary },
      { path: "safety-mode", Component: SafetyMode },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
