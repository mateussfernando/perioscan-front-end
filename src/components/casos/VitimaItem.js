"use client";

import { User, UserCheck, UserX } from "lucide-react";

export default function VitimaItem({
  vitima,
  onVisualizar,
  onEditar,
  onExcluir,
}) {
  // Função para formatar o tipo de identificação
  const formatarTipoIdentificacao = (tipo) => {
    if (!tipo) return "Não informado";
    const tipos = {
      identificada: "Identificada",
      não_identificada: "Não Identificada",
    };
    return tipos[tipo] || tipo;
  };

  // Função para obter a classe CSS baseada no tipo de identificação
  const getIdentificacaoClassName = (tipo) => {
    if (!tipo) return "status-desconhecido";
    switch (tipo.toLowerCase()) {
      case "identificada":
        return "status-identificada";
      case "não_identificada":
        return "status-nao-identificada";
      default:
        return "status-outro";
    }
  };

  // Função para obter o ícone baseado no tipo de identificação
  const getIdentificacaoIcon = (tipo) => {
    if (!tipo) return <User size={14} />;
    switch (tipo.toLowerCase()) {
      case "identificada":
        return <UserCheck size={14} />;
      case "não_identificada":
        return <UserX size={14} />;
      default:
        return <User size={14} />;
    }
  };

  return (
    <div className="evidencia-item">
      <div className="evidencia-info">
        <div className="evidencia-header-item">
          <div className="evidencia-tipo">
            {getIdentificacaoIcon(vitima.identificationType)}
            <span>{vitima.name || "Não identificada"}</span>
          </div>
          <div
            className={`evidencia-status ${getIdentificacaoClassName(
              vitima.identificationType
            )}`}
          >
            {formatarTipoIdentificacao(vitima.identificationType)}
          </div>
        </div>

        <div className="evidencia-detalhes">
          <div className="evidencia-meta">
            <span>
              <strong>NIC:</strong> {vitima.nic || "Não informado"}
            </span>
            <span>
              <strong>Registrado por:</strong>{" "}
              {vitima.registeredBy?.name ||
                vitima.registeredBy?.email ||
                "Não informado"}
            </span>
          </div>
        </div>
      </div>

      <div className="evidencia-acoes">
        <button
          className="btn-acao btn-visualizar"
          onClick={() => onVisualizar(vitima)}
          title="Visualizar Vítima"
        >
          <User size={16} />
        </button>
      </div>
    </div>
  );
}
