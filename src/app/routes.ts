import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { BB84Simulator } from "./pages/BB84Simulator";
import { EncryptionPage } from "./pages/EncryptionPage";
import { EavesdroppingPage } from "./pages/EavesdroppingPage";
import { AnalysisPage } from "./pages/AnalysisPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: BB84Simulator },
      { path: "encryption", Component: EncryptionPage },
      { path: "eavesdropping", Component: EavesdroppingPage },
      { path: "analysis", Component: AnalysisPage },
    ],
  },
]);
