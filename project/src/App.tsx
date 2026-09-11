import { useState } from "react";
import { globalStyles } from "@washingtonpost/wpds-ui-kit";
import { HomePage } from "./pages/HomePage";
import { RecorderPage } from "./pages/RecorderPage";
import { ChartPage } from "./pages/ChartPage";
import { Protocol } from "./lib/supabase";

globalStyles();

type View = "home" | "recorder" | "chart";

function App() {
  const [view, setView] = useState<View>("home");
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);

  function openProtocol(p: Protocol) {
    setActiveProtocol(p);
    setView("recorder");
  }

  if (view === "recorder" && activeProtocol) {
    return (
      <RecorderPage
        protocol={activeProtocol}
        onBack={() => setView("home")}
        onShowChart={() => setView("chart")}
      />
    );
  }

  if (view === "chart" && activeProtocol) {
    return (
      <ChartPage
        protocol={activeProtocol}
        onBack={() => setView("recorder")}
      />
    );
  }

  return <HomePage onSelectProtocol={openProtocol} />;
}

export default App;
