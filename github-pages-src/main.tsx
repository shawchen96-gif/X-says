import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import WordApp from "../app/WordApp";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WordApp />
  </StrictMode>,
);
