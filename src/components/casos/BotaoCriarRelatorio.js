"use client";

import { useState } from "react";
import ModalCriarRelatorio from "./ModalCriarRelatorio";
import "../../styles/botao-criar-relatorio.css";

const BotaoCriarRelatorio = ({ casoId, casoTitulo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRelatorioCriado = (relatorio) => {
    // Aqui você pode adicionar lógica adicional após a criação do relatório
    console.log("Relatório criado:", relatorio);
  };

  return (
    <>
      <button className="btn-criar-relatorio" onClick={handleOpenModal}>
        <span className="icon-relatorio">📄</span>
        <span>Criar Relatório</span>
      </button>

      <ModalCriarRelatorio
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        casoId={casoId}
        casoTitulo={casoTitulo}
        onRelatorioCriado={handleRelatorioCriado}
      />
    </>
  );
};

export default BotaoCriarRelatorio;
