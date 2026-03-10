import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import "./index.css"; // <= adiciona isso

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoutes />
    <Toaster position="top-right" />
  </React.StrictMode>,
);
