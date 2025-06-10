import React, { useRef } from "react";
import SVG from "react-inlinesvg";

const teethIds = [
  'tooth11','tooth12','tooth13','tooth14','tooth15','tooth16','tooth17','tooth18',
  'tooth21','tooth22','tooth23','tooth24','tooth25','tooth26','tooth27','tooth28',
  'tooth31','tooth32','tooth33','tooth34','tooth35','tooth36','tooth37','tooth38',
  'tooth41','tooth42','tooth43','tooth44','tooth45','tooth46','tooth47','tooth48'
];

export default function OdontogramaSVG({ onDenteClick, style }) {
  const svgWrapperRef = useRef(null);

  // Função de clique única para todos os dentes
  function handleToothClick(e) {
    if (onDenteClick) {
      onDenteClick(e, e.currentTarget);
    }
  }

  function handleSVGLoad(svgEl) {
    // Pequeno delay para garantir que o SVG está no DOM
    setTimeout(() => {
      if (!svgEl || typeof svgEl.querySelector !== 'function') return;
      teethIds.forEach((id) => {
        const dente = svgEl.querySelector(`#${id}`);
        if (dente) {
          dente.style.cursor = 'pointer';
          dente.style.pointerEvents = 'all';
          dente.removeEventListener('click', handleToothClick);
          dente.addEventListener('click', handleToothClick);
        }
      });
    }, 0);
  }

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }} ref={svgWrapperRef}>
      <SVG src="/assets/odontograma.svg" style={style} onLoad={handleSVGLoad} />
    </div>
  );
} 