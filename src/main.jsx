import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Error boundary simple: evita que un error en cualquier parte del árbol deje
// una pantalla en blanco sin ninguna pista de qué pasó.
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error("Tinta crash:", err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
          background: "#1C1712", color: "#EDE0C8", fontFamily: "system-ui,sans-serif",
          padding: 24, textAlign: "center",
        }}>
          <h2 style={{ margin: 0 }}>Algo salió mal</h2>
          <p style={{ color: "#B8A98C", maxWidth: 360, margin: 0 }}>
            Recargá la página. Si el error persiste, revisá la consola del navegador.
          </p>
          <button onClick={() => window.location.reload()} style={{
            background: "#B5483D", color: "#F5EAD2", border: "none", borderRadius: 8,
            padding: "10px 18px", cursor: "pointer", fontSize: 14,
          }}>Recargar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary><App/></ErrorBoundary>
  </React.StrictMode>
);
