import React, { StrictMode, useState} from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import App from "./App";


const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);