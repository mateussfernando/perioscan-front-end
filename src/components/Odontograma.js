"use client";

import { useEffect, useState, useRef } from "react";
import OdontogramaSVG from "./OdontogramaSVG";

const teethIds = [
  "tooth11",
  "tooth12",
  "tooth13",
  "tooth14",
  "tooth15",
  "tooth16",
  "tooth17",
  "tooth18",
  "tooth21",
  "tooth22",
  "tooth23",
  "tooth24",
  "tooth25",
  "tooth26",
  "tooth27",
  "tooth28",
  "tooth31",
  "tooth32",
  "tooth33",
  "tooth34",
  "tooth35",
  "tooth36",
  "tooth37",
  "tooth38",
  "tooth41",
  "tooth42",
  "tooth43",
  "tooth44",
  "tooth45",
  "tooth46",
  "tooth47",
  "tooth48",
];

export default function OdontogramaModal({ aberto, onClose }) {
  const [modalComentario, setModalComentario] = useState(false);
  const [denteSelecionado, setDenteSelecionado] = useState(null);
  const [comentarioAtual, setComentarioAtual] = useState("");
  const [comentarios, setComentarios] = useState({});

  // Handler para clique no dente
  function handleDenteClick(e, dente) {
    const id = dente?.id || e?.target?.id;
    if (id && teethIds.includes(id)) {
      setDenteSelecionado(id);
      setComentarioAtual(comentarios[id] || "");
      setModalComentario(true);
    }
  }

  const salvarComentario = () => {
    setComentarios((prev) => ({
      ...prev,
      [denteSelecionado]: comentarioAtual,
    }));
    setModalComentario(false);
  };

  return (
    <>
      {aberto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.65)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              padding: 32,
              width: "90vw",
              height: "85vh",
              maxWidth: "1200px",
              overflow: "auto",
              position: "relative",
              minWidth: 320,
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 28,
                cursor: "pointer",
                color: "#333",
              }}
            >
              &times;
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 18 }}>Odontograma</h3>
            <div
              style={{
                width: "100%",
                height: "calc(100% - 60px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              <OdontogramaSVG
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  display: "block",
                }}
                onDenteClick={handleDenteClick}
                aberto={aberto}
              />
            </div>
          </div>
        </div>
      )}
      {modalComentario && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.65)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              padding: 24,
              minWidth: 320,
              maxWidth: 400,
              width: "90vw",
              position: "relative",
            }}
          >
            <button
              onClick={() => setModalComentario(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 14,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#333",
              }}
            >
              &times;
            </button>
            <h4 style={{ marginTop: 0 }}>
              Comentário do dente{" "}
              {denteSelecionado && denteSelecionado.replace("tooth", "")}
            </h4>
            <textarea
              value={comentarioAtual}
              onChange={(e) => setComentarioAtual(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                borderRadius: 6,
                border: "1px solid #ccc",
                padding: 8,
                marginBottom: 16,
              }}
              placeholder="Digite um comentário para este dente..."
            />
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button
                onClick={() => setModalComentario(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "none",
                  background: "#eee",
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
              <button
                onClick={salvarComentario}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "none",
                  background: "#222",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Odontograma() {
  const [modalAberto, setModalAberto] = useState(false);
  const [denteSelecionado, setDenteSelecionado] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [comentarioAtual, setComentarioAtual] = useState("");
  const svgRef = useRef(null);

  useEffect(() => {
    // Pega o SVG pelo seletor
    const svg = document.querySelector("svg");
    if (!svg) return;
    // Adiciona listeners de clique nos dentes
    teethIds.forEach((id) => {
      const dente = svg.querySelector(`#${id}`);
      if (dente) {
        dente.style.cursor = "pointer";
        dente.addEventListener("click", handleToothClick);
      }
    });
    function handleToothClick(e) {
      const id = e.currentTarget.id;
      setDenteSelecionado(id);
      setComentarioAtual(comentarios[id] || "");
      setModalAberto(true);
    }
    return () => {
      if (!svg) return;
      teethIds.forEach((id) => {
        const dente = svg.querySelector(`#${id}`);
        if (dente) dente.removeEventListener("click", handleToothClick);
      });
    };
  }, [comentarios]);

  function salvarComentario() {
    setComentarios((prev) => ({
      ...prev,
      [denteSelecionado]: comentarioAtual,
    }));
    setModalAberto(false);
  }

  return (
    <div style={{ position: "relative" }}>
      {/* SVG INLINE ABAIXO */}
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <OdontogramaSVG />
      </div>
      {modalAberto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setModalAberto(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 24,
              minWidth: 400,
              width: "500px",
              maxWidth: "90vw",
              boxShadow: "0 4px 24px #0002",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 12 }}>
              Comentário do dente <b>{denteSelecionado}</b>
            </h3>
            <textarea
              value={comentarioAtual}
              onChange={(e) => setComentarioAtual(e.target.value)}
              rows={5}
              style={{ width: "100%", marginBottom: 16, resize: "vertical" }}
              placeholder="Digite um comentário para este dente..."
            />
            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  padding: "6px 18px",
                  borderRadius: 4,
                  border: "none",
                  background: "#eee",
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
              <button
                onClick={salvarComentario}
                style={{
                  padding: "6px 18px",
                  borderRadius: 4,
                  border: "none",
                  background: "#222",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
