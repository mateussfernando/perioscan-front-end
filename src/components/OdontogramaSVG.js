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

export default function OdontogramaSVG({
  onDenteClick,
  onDenteHover,
  dentesComDados,
  style,
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch("/assets/odontograma.svg");
        const svgText = await response.text();

        if (svgRef.current) {
          svgRef.current.innerHTML = svgText;

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

          // Adiciona event listeners e estilos visuais aos dentes
          teethIds.forEach((id) => {
            const dente = svgRef.current.querySelector(`#${id}`);
            if (dente) {
              dente.style.cursor = "pointer";
              dente.style.pointerEvents = "all";
              dente.style.transition = "fill 0.2s ease, stroke 0.2s ease";

              // Aplicar estilo visual se o dente tem dados
              const numeroTooth = id.replace("tooth", "");
              if (dentesComDados && dentesComDados.has(numeroTooth)) {
                // Dente com dados - cor azul
                dente.style.fill = "#3B82F6";
                dente.style.stroke = "#1E40AF";
                dente.style.strokeWidth = "2";

                // Adicionar um pequeno indicador visual
                const rect = dente.getBoundingClientRect();
                if (rect.width > 0) {
                  // Criar um pequeno círculo indicador
                  const indicator = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                  );
                  indicator.setAttribute("cx", "0");
                  indicator.setAttribute("cy", "0");
                  indicator.setAttribute("r", "3");
                  indicator.setAttribute("fill", "#10B981");
                  indicator.setAttribute("stroke", "#fff");
                  indicator.setAttribute("stroke-width", "1");
                  indicator.style.pointerEvents = "none";

                  // Posicionar o indicador no canto superior direito do dente
                  const bbox = dente.getBBox();
                  indicator.setAttribute("cx", bbox.x + bbox.width - 5);
                  indicator.setAttribute("cy", bbox.y + 5);

                  // Adicionar ao SVG
                  const svg = dente.closest("svg");
                  if (svg) {
                    svg.appendChild(indicator);
                  }
                }
              } else {
                // Dente sem dados - cor padrão
                dente.style.fill = "#F3F4F6";
                dente.style.stroke = "#D1D5DB";
                dente.style.strokeWidth = "1";
              }

              // Remove listeners anteriores
              dente.removeEventListener("click", handleToothClick);
              dente.removeEventListener("mouseenter", handleToothMouseEnter);
              dente.removeEventListener("mouseleave", handleToothMouseLeave);

              // Adiciona novos listeners
              dente.addEventListener("click", handleToothClick);
              dente.addEventListener("mouseenter", handleToothMouseEnter);
              dente.addEventListener("mouseleave", handleToothMouseLeave);
            }
          });
        }
      } catch (error) {
        console.error("Erro ao carregar SVG:", error);
      }
    };

    loadSVG();

    return () => {
      if (svgRef.current) {
        teethIds.forEach((id) => {
          const dente = svgRef.current.querySelector(`#${id}`);
          if (dente) {
            dente.removeEventListener("click", handleToothClick);
            dente.removeEventListener("mouseenter", handleToothMouseEnter);
            dente.removeEventListener("mouseleave", handleToothMouseLeave);
          }
        });
      }
    };
  }, [dentesComDados]);

  function handleToothClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (onDenteClick) {
      onDenteClick(e, e.currentTarget);
    }
  }

  function handleToothMouseEnter(e) {
    e.preventDefault();
    e.stopPropagation();

    if (onDenteHover) {
      onDenteHover(e, e.currentTarget, true);
    }

    // Efeito visual de hover muito sutil
    const numeroTooth = e.currentTarget.id.replace("tooth", "");
    if (dentesComDados && dentesComDados.has(numeroTooth)) {
      // Dente com dados - hover mais escuro sutil
      e.currentTarget.style.fill = "#2563EB";
      e.currentTarget.style.stroke = "#1D4ED8";
    } else {
      // Dente sem dados - hover cinza muito sutil
      e.currentTarget.style.fill = "#E5E7EB";
      e.currentTarget.style.stroke = "#9CA3AF";
    }
  }

  function handleToothMouseLeave(e) {
    e.preventDefault();
    e.stopPropagation();

    if (onDenteHover) {
      onDenteHover(e, e.currentTarget, false);
    }

    // Restaurar estilo original
    const numeroTooth = e.currentTarget.id.replace("tooth", "");
    if (dentesComDados && dentesComDados.has(numeroTooth)) {
      // Dente com dados - cor original
      e.currentTarget.style.fill = "#3B82F6";
      e.currentTarget.style.stroke = "#1E40AF";
    } else {
      // Dente sem dados - cor original
      e.currentTarget.style.fill = "#F3F4F6";
      e.currentTarget.style.stroke = "#D1D5DB";
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
