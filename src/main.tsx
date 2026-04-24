import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force cache invalidation - PWA setup complete

createRoot(document.getElementById("root")!).render(<App />);
