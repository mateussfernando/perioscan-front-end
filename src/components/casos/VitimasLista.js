"use client";

import { User, Search, Filter, Edit, Trash } from "lucide-react";
import OdontogramaModal from "../Odontograma";
import { useState } from "react";

export default function VitimasLista({
  vitimas,
  loadingVitimas,
  errorVitimas,
  onAdicionarVitima,
  onEditarVitima,
  onExcluirVitima,
}) {
  const [modalOdontogramaAberto, setModalOdontogramaAberto] = useState(false);
  const [vitimaSelecionada, setVitimaSelecionada] = useState(null);

  const abrirOdontograma = (vitima) => {
    setVitimaSelecionada(vitima);
    setModalOdontogramaAberto(true);
  };
  const fecharOdontograma = () => {
    setModalOdontogramaAberto(false);
    setVitimaSelecionada(null);
  };

  // Função para formatar o tipo de identificação
  const formatarTipoIdentificacao = (tipo) => {
    if (!tipo) return "Não informado";
    const tipos = {
      identificada: "Identificada",
      não_identificada: "Não Identificada",
      nao_identificada: "Não Identificada",
      identificada: "Identificada",
    };
    return tipos[tipo] || tipo;
  };

  // Função para obter a classe CSS baseada no tipo de identificação
  const getIdentificacaoClassName = (tipo) => {
    if (!tipo) return "evidencia-tipo tipo-outro";
    const tipoLower = tipo.toLowerCase().replace("_", "");
    switch (tipoLower) {
      case "identificada":
        return "evidencia-tipo tipo-identificada";
      case "naoidentificada":
      case "não_identificada":
        return "evidencia-tipo tipo-nao-identificada";
      default:
        return "evidencia-tipo tipo-outro";
    }
  };

  // Função para obter o nome do usuário que registrou
  const getRegistradoPor = (registeredBy) => {
    if (!registeredBy) return "Não informado";

    if (typeof registeredBy === "string") return registeredBy;

    if (typeof registeredBy === "object") {
      return (
        registeredBy.name ||
        registeredBy.email ||
        registeredBy.username ||
        "Não informado"
      );
    }

    return "Não informado";
  };

  console.log("Vítimas recebidas no componente:", vitimas);

  return (
    <div className="evidencias-section">
      <h2>Vítimas</h2>

      {/* Botão de adicionar vítima */}
      <button
        className="btn-adicionar-vitima"
        onClick={onAdicionarVitima}
        style={{
          marginBottom: 16,
          background: "#000",
          color: "#fff",
          borderRadius: 4,
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <User style={{ color: "#fff" }} size={18} />
        Adicionar Vítima
      </button>

      {/* Filtro de busca igual ao das evidências */}
      <div className="evidencias-filtro">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar vítima..."
              className="search-input"
              disabled
            />
          </div>
          <button className="filter-toggle" disabled>
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      {loadingVitimas ? (
        <div className="loading-evidencias">Carregando vítimas...</div>
      ) : errorVitimas ? (
        <div className="error-message">{errorVitimas}</div>
      ) : !vitimas || vitimas.length === 0 ? (
        <div className="no-evidencias">
          Nenhuma vítima registrada para este caso
        </div>
      ) : (
        <div className="evidencias-tabela">
          <table>
            <thead>
              <tr>
                <th>Nome/Identificação</th>
                <th>NIC</th>
                <th>Idade</th>
                <th>Gênero</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vitimas.map((vitima, index) => (
                <tr
                  key={vitima._id || vitima.id || index}
                  className="evidencia-row"
                >
                  <td>
                    <div className="evidencia-info-cell">
                      <div className="evidencia-titulo">
                        {vitima.identificationType === "identificada"
                          ? vitima.name || "Não informado"
                          : vitima.referenceCode || "Não identificada"}
                      </div>
                    </div>
                  </td>
                  <td>{vitima.nic || "Não informado"}</td>
                  <td>{vitima.age || "-"}</td>
                  <td>
                    {vitima.gender
                      ? vitima.gender.charAt(0).toUpperCase() +
                        vitima.gender.slice(1)
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={getIdentificacaoClassName(
                        vitima.identificationType
                      )}
                    >
                      {formatarTipoIdentificacao(vitima.identificationType)}
                    </span>
                  </td>
                  <td>
                    <div
                      className="acoes-cell"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        className="btn-acao"
                        title="Odontograma"
                        onClick={() => abrirOdontograma(vitima)}
                        style={{
                          background: "#0070f3",
                          border: "none",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "4px",
                          color: "#fff",
                          fontSize: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        🦷
                      </button>
                      <button
                        className="btn-acao"
                        title="Editar Vítima"
                        onClick={() => onEditarVitima && onEditarVitima(vitima)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px",
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-acao"
                        title="Excluir Vítima"
                        onClick={() =>
                          onExcluirVitima && onExcluirVitima(vitima)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px",
                          color: "#a52e40",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOdontogramaAberto && (
        <OdontogramaModal
          aberto={modalOdontogramaAberto}
          onClose={fecharOdontograma}
          vitima={vitimaSelecionada}
        />
      )}
    </div>
  );
}
