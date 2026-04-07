import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFromScreenData } from "./data/impressionStore";

initFromScreenData();

createRoot(document.getElementById("root")!).render(<App />);
