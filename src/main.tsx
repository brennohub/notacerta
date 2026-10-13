import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { LimiteDeErro } from "./components/TelaDeErro";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LimiteDeErro>
      <App />
    </LimiteDeErro>
  </StrictMode>,
);
