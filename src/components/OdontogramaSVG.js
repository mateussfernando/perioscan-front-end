"use client";

import { useEffect, useRef } from "react";

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

export default function OdontogramaSVG({ onDenteClick, style }) {
  const svgRef = useRef(null);

  useEffect(() => {
    // Carrega o SVG diretamente
    const loadSVG = async () => {
      try {
        const response = await fetch("/assets/odontograma.svg");
        const svgText = await response.text();

        if (svgRef.current) {
          svgRef.current.innerHTML = svgText;

          // Dentro do useEffect, após svgRef.current.innerHTML = svgText
          const svgElement = svgRef.current.querySelector("svg");
          if (svgElement) {
            svgElement.style.width = "100%";
            svgElement.style.height = "auto";
            svgElement.style.maxWidth = "1000px";
            svgElement.style.maxHeight = "700px";
            svgElement.style.display = "block";
            svgElement.style.margin = "0 auto";
            svgElement.style.minWidth = "800px";
            svgElement.style.minHeight = "500px";
          }

          // Adiciona event listeners aos dentes
          teethIds.forEach((id) => {
            const dente = svgRef.current.querySelector(`#${id}`);
            if (dente) {
              dente.style.cursor = "pointer";
              dente.style.pointerEvents = "all";

              // Remove listener anterior se existir
              dente.removeEventListener("click", handleToothClick);
              dente.addEventListener("click", handleToothClick);

              // Adiciona hover effect
              dente.addEventListener("mouseenter", () => {
                dente.style.opacity = "0.7";
              });

              dente.addEventListener("mouseleave", () => {
                dente.style.opacity = "1";
              });
            }
          });
        }
      } catch (error) {
        console.error("Erro ao carregar SVG:", error);
      }
    };

    loadSVG();
  }, []);

  function handleToothClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (onDenteClick) {
      onDenteClick(e, e.currentTarget);
    }
  }

  return (
    <div
      ref={svgRef}
      style={{
        width: "100%",
        maxWidth: "1000px",
        height: "auto",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "500px",
        ...style,
      }}
    />
  );
}
