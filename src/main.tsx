import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const saved = localStorage.getItem("falcon.theme");
if (saved === "dark") document.documentElement.classList.add("dark");
else if (saved === "light") document.documentElement.classList.remove("dark");

createRoot(document.getElementById("root")!).render(<App />);
