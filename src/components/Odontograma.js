"use client";

import { useEffect, useState } from "react";
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

const statusOptions = [
  { value: "presente", label: "Presente" },
  { value: "ausente_ante_mortem", label: "Ausente Ante Mortem" },
  { value: "ausente_post_mortem", label: "Ausente Post Mortem" },
  { value: "fraturado", label: "Fraturado" },
  { value: "não_avaliado", label: "Não Avaliado" },
];

const crownOptions = [
  { value: "não", label: "Não" },
  { value: "metálica", label: "Metálica" },
  { value: "cerâmica", label: "Cerâmica" },
  { value: "porcelana", label: "Porcelana" },
  { value: "resina", label: "Resina" },
];

export default function OdontogramaModal({ aberto, onClose, vitima }) {
  const [modalComentario, setModalComentario] = useState(false);
  const [denteSelecionado, setDenteSelecionado] = useState(null);
  const [dadosDente, setDadosDente] = useState({
    annotations: "",
    status: "presente",
    crown: "não",
    rootCanal: false,
    restorations: "",
    fractures: "",
    wear: "",
    discoloration: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [dadosOdontograma, setDadosOdontograma] = useState({});
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [sucessoSalvar, setSucessoSalvar] = useState(false);
  const [dentesComDados, setDentesComDados] = useState(new Set());

  // Carregar dados do odontograma quando abrir
  useEffect(() => {
    if (aberto && vitima) {
      carregarDadosOdontograma();
    }
  }, [aberto, vitima]);

  const carregarDadosOdontograma = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !vitima) return;

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/victims/${
          vitima._id || vitima.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const odontogramData = data.data?.odontogram || {};
        setDadosOdontograma(odontogramData);

        // Identificar dentes com dados
        const dentesComInfo = new Set();
        Object.keys(odontogramData).forEach((key) => {
          if (key.startsWith("tooth") && odontogramData[key]) {
            const numero = key.replace("tooth", "");
            dentesComInfo.add(numero);
          }
        });
        setDentesComDados(dentesComInfo);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do odontograma:", error);
    }
  };

  const handleDenteClick = (e, dente) => {
    const id = dente?.id || e?.target?.id;
    if (id && teethIds.includes(id)) {
      const numeroTooth = id.replace("tooth", "");
      setDenteSelecionado(numeroTooth);

      // Carregar dados existentes do dente
      const dadosExistentes = dadosOdontograma[`tooth${numeroTooth}`] || {};
      setDadosDente({
        annotations: dadosExistentes.annotations || "",
        status: dadosExistentes.status || "presente",
        crown: dadosExistentes.crown || "não",
        rootCanal: dadosExistentes.rootCanal || false,
        restorations: Array.isArray(dadosExistentes.restorations)
          ? dadosExistentes.restorations.join(", ")
          : dadosExistentes.restorations || "",
        fractures: dadosExistentes.fractures || "",
        wear: dadosExistentes.wear || "",
        discoloration: dadosExistentes.discoloration || "",
      });

      setModalComentario(true);
      setErro("");
      setSucessoSalvar(false);
    }
  };

  const handleDenteHover = (e, dente, isEnter) => {
    if (!isEnter) {
      setTooltipInfo(null);
      return;
    }

    const id = dente?.id || e?.target?.id;
    if (id && teethIds.includes(id)) {
      const numeroTooth = id.replace("tooth", "");
      const dadosDente = dadosOdontograma[`tooth${numeroTooth}`];

      if (dadosDente && Object.keys(dadosDente).length > 0) {
        const rect = e.target.getBoundingClientRect();
        setTooltipInfo({
          data: dadosDente,
          position: {
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY - 10,
          },
          numero: numeroTooth,
        });
      }
    }
  };

  const handleInputChange = (field, value) => {
    setDadosDente((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const salvarDadosDente = async () => {
    if (!vitima || !denteSelecionado) return;

    setSalvando(true);
    setErro("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      // Preparar dados para envio
      const dadosParaEnvio = {
        ...dadosDente,
        restorations: dadosDente.restorations
          ? dadosDente.restorations
              .split(",")
              .map((r) => r.trim())
              .filter((r) => r)
          : [],
      };

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/victims/${
          vitima._id || vitima.id
        }/odontogram/${denteSelecionado}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnvio),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao salvar dados do dente");
      }

      // Atualizar dados locais
      setDadosOdontograma((prev) => ({
        ...prev,
        [`tooth${denteSelecionado}`]: dadosParaEnvio,
      }));

      // Adicionar dente à lista de dentes com dados
      setDentesComDados((prev) => new Set([...prev, denteSelecionado]));

      // Mostrar feedback de sucesso
      setSucessoSalvar(true);

      // Fechar modal após um breve delay
      setTimeout(() => {
        setModalComentario(false);
        setSucessoSalvar(false);
      }, 1500);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const formatarStatusLabel = (status) => {
    const statusMap = {
      presente: "Presente",
      ausente_ante_mortem: "Ausente Ante Mortem",
      ausente_post_mortem: "Ausente Post Mortem",
      fraturado: "Fraturado",
      não_avaliado: "Não Avaliado",
    };
    return statusMap[status] || status;
  };

  const formatarCrownLabel = (crown) => {
    const crownMap = {
      não: "Não",
      metálica: "Metálica",
      cerâmica: "Cerâmica",
      porcelana: "Porcelana",
      resina: "Resina",
    };
    return crownMap[crown] || crown;
  };

  const inputStyle = {
    width: "100%",
    borderRadius: 6,
    border: "1px solid #ddd",
    padding: "10px 12px",
    fontSize: "14px",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    resize: "vertical",
    transition: "border-color 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    fontWeight: 600,
    fontSize: "14px",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#374151",
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
                zIndex: 1,
              }}
            >
              &times;
            </button>
            <h3
              style={{
                marginTop: 0,
                marginBottom: 18,
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "24px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Odontograma - {vitima?.name || vitima?.referenceCode || "Vítima"}
            </h3>
            <div
              style={{
                width: "100%",
                height: "calc(100% - 60px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                position: "relative",
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
                onDenteHover={handleDenteHover}
                dentesComDados={dentesComDados}
                aberto={aberto}
              />

              {tooltipInfo && (
                <div
                  style={{
                    position: "fixed",
                    top: `${tooltipInfo.position.y - 20}px`,
                    left: `${tooltipInfo.position.x}px`,
                    transform: "translate(-50%, -100%)",
                    background: "#ffffff",
                    color: "#111827",
                    padding: "16px 20px",
                    borderRadius: 8,
                    fontSize: 13,
                    zIndex: 10001,
                    maxWidth: 300,
                    minWidth: 200,
                    pointerEvents: "none",
                    boxShadow:
                      "0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.1)",
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "700",
                      marginBottom: 12,
                      fontSize: 14,
                      color: "#111827",
                    }}
                  >
                    Dente {tooltipInfo.numero}
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>
                        Status:
                      </span>
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        {formatarStatusLabel(tooltipInfo.data.status)}
                      </span>
                    </div>

                    {tooltipInfo.data.crown &&
                      tooltipInfo.data.crown !== "não" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: "#6b7280", fontSize: "12px" }}>
                            Coroa:
                          </span>
                          <span style={{ fontWeight: 600, color: "#374151" }}>
                            {formatarCrownLabel(tooltipInfo.data.crown)}
                          </span>
                        </div>
                      )}

                    {tooltipInfo.data.rootCanal && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#6b7280", fontSize: "12px" }}>
                          Canal:
                        </span>
                        <span style={{ fontWeight: 600, color: "#111827" }}>
                          Sim
                        </span>
                      </div>
                    )}

                    {tooltipInfo.data.restorations &&
                      tooltipInfo.data.restorations.length > 0 && (
                        <div
                          style={{
                            marginTop: 6,
                            paddingTop: 6,
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          <span
                            style={{
                              color: "#6b7280",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            Restaurações:
                          </span>
                          <div
                            style={{
                              fontSize: 12,
                              marginTop: 2,
                              color: "#374151",
                            }}
                          >
                            {Array.isArray(tooltipInfo.data.restorations)
                              ? tooltipInfo.data.restorations.join(", ")
                              : tooltipInfo.data.restorations}
                          </div>
                        </div>
                      )}

                    {tooltipInfo.data.fractures && (
                      <div
                        style={{
                          marginTop: 6,
                          paddingTop: 6,
                          borderTop: "1px solid #f3f4f6",
                        }}
                      >
                        <span
                          style={{
                            color: "#6b7280",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Fraturas:
                        </span>
                        <div
                          style={{
                            fontSize: 12,
                            marginTop: 2,
                            color: "#374151",
                          }}
                        >
                          {tooltipInfo.data.fractures.length > 40
                            ? tooltipInfo.data.fractures.substring(0, 40) +
                              "..."
                            : tooltipInfo.data.fractures}
                        </div>
                      </div>
                    )}

                    {tooltipInfo.data.annotations && (
                      <div
                        style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: "1px solid #f3f4f6",
                        }}
                      >
                        <span
                          style={{
                            color: "#6b7280",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Anotações:
                        </span>
                        <div
                          style={{
                            fontSize: 12,
                            marginTop: 2,
                            color: "#374151",
                            fontStyle: "italic",
                          }}
                        >
                          {tooltipInfo.data.annotations.length > 60
                            ? tooltipInfo.data.annotations.substring(0, 60) +
                              "..."
                            : tooltipInfo.data.annotations}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            background: "rgba(0,0,0,0.75)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              minWidth: 320,
              maxWidth: 900,
              width: "95%",
              maxHeight: "90vh",
              overflow: "hidden",
              position: "relative",
              display: "flex",
            }}
          >
            {/* Sidebar com informações do dente */}
            <div
              style={{
                width: "300px",
                background: "#f8fafc",
                borderRight: "1px solid #e2e8f0",
                padding: "24px",
                overflow: "auto",
              }}
            >
              <h5
                style={{
                  margin: "0 0 16px 0",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Informações do Dente {denteSelecionado}
              </h5>

              <div style={{ display: "grid", gap: 12, fontSize: "13px" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    Status
                  </div>
                  <div style={{ color: "#111827" }}>
                    {formatarStatusLabel(dadosDente.status)}
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    Coroa
                  </div>
                  <div style={{ color: "#111827" }}>
                    {formatarCrownLabel(dadosDente.crown)}
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    Tratamento de Canal
                  </div>
                  <div
                    style={{
                      color: dadosDente.rootCanal ? "#059669" : "#6b7280",
                    }}
                  >
                    {dadosDente.rootCanal ? "Sim" : "Não"}
                  </div>
                </div>

                {dadosDente.restorations && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Restaurações
                    </div>
                    <div style={{ color: "#111827", fontSize: "12px" }}>
                      {dadosDente.restorations || "Nenhuma"}
                    </div>
                  </div>
                )}

                {dadosDente.fractures && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Fraturas
                    </div>
                    <div style={{ color: "#111827", fontSize: "12px" }}>
                      {dadosDente.fractures || "Nenhuma"}
                    </div>
                  </div>
                )}

                {dadosDente.wear && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Desgaste
                    </div>
                    <div style={{ color: "#111827", fontSize: "12px" }}>
                      {dadosDente.wear || "Nenhum"}
                    </div>
                  </div>
                )}

                {dadosDente.discoloration && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Alterações de Cor
                    </div>
                    <div style={{ color: "#111827", fontSize: "12px" }}>
                      {dadosDente.discoloration || "Nenhuma"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Formulário principal */}
            <div style={{ flex: 1, padding: "24px", overflow: "auto" }}>
              <button
                onClick={() => setModalComentario(false)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 16,
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#6b7280",
                  zIndex: 1,
                }}
              >
                &times;
              </button>

              <h4
                style={{
                  marginTop: 0,
                  marginBottom: 24,
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Editar Dente {denteSelecionado}
              </h4>

              {sucessoSalvar && (
                <div
                  style={{
                    background: "#d1fae5",
                    color: "#065f46",
                    padding: "12px 16px",
                    borderRadius: 8,
                    marginBottom: 20,
                    fontSize: 14,
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>✓</span>
                  Dados do dente salvos com sucesso!
                </div>
              )}

              {erro && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "12px 16px",
                    borderRadius: 8,
                    marginBottom: 20,
                    fontSize: 14,
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    border: "1px solid #fecaca",
                  }}
                >
                  {erro}
                </div>
              )}

              <div style={{ display: "grid", gap: 20 }}>
                {/* Status */}
                <div>
                  <label style={labelStyle}>Status do Dente</label>
                  <select
                    value={dadosDente.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                    }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Anotações */}
                <div>
                  <label style={labelStyle}>
                    Anotações ({dadosDente.annotations.length}/500)
                  </label>
                  <textarea
                    value={dadosDente.annotations}
                    onChange={(e) =>
                      handleInputChange(
                        "annotations",
                        e.target.value.slice(0, 500)
                      )
                    }
                    rows={4}
                    style={{
                      ...inputStyle,
                      minHeight: "100px",
                    }}
                    placeholder="Digite observações detalhadas sobre este dente..."
                  />
                </div>

                {/* Tipo de Coroa */}
                <div>
                  <label style={labelStyle}>Tipo de Coroa</label>
                  <select
                    value={dadosDente.crown}
                    onChange={(e) => handleInputChange("crown", e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                    }}
                  >
                    {crownOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tratamento de Canal */}
                <div>
                  <label
                    style={{
                      ...labelStyle,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={dadosDente.rootCanal}
                      onChange={(e) =>
                        handleInputChange("rootCanal", e.target.checked)
                      }
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                    Tratamento de Canal
                  </label>
                </div>

                {/* Restaurações */}
                <div>
                  <label style={labelStyle}>
                    Restaurações (separadas por vírgula)
                  </label>
                  <textarea
                    value={dadosDente.restorations}
                    onChange={(e) =>
                      handleInputChange("restorations", e.target.value)
                    }
                    rows={3}
                    style={inputStyle}
                    placeholder="Ex: Amálgama oclusal, Resina composta mesial..."
                  />
                </div>

                {/* Fraturas */}
                <div>
                  <label style={labelStyle}>Fraturas</label>
                  <textarea
                    value={dadosDente.fractures}
                    onChange={(e) =>
                      handleInputChange("fractures", e.target.value)
                    }
                    rows={3}
                    style={inputStyle}
                    placeholder="Descreva fraturas observadas..."
                  />
                </div>

                {/* Desgaste */}
                <div>
                  <label style={labelStyle}>Desgaste</label>
                  <textarea
                    value={dadosDente.wear}
                    onChange={(e) => handleInputChange("wear", e.target.value)}
                    rows={3}
                    style={inputStyle}
                    placeholder="Descreva padrões de desgaste observados..."
                  />
                </div>

                {/* Alterações de Cor */}
                <div>
                  <label style={labelStyle}>Alterações de Cor</label>
                  <textarea
                    value={dadosDente.discoloration}
                    onChange={(e) =>
                      handleInputChange("discoloration", e.target.value)
                    }
                    rows={3}
                    style={inputStyle}
                    placeholder="Descreva alterações de coloração..."
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 32,
                  paddingTop: 20,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  onClick={() => setModalComentario(false)}
                  disabled={salvando}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    cursor: salvando ? "not-allowed" : "pointer",
                    color: "#374151",
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarDadosDente}
                  disabled={salvando}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 8,
                    border: "none",
                    background: salvando ? "#6b7280" : "#111827",
                    color: "#fff",
                    cursor: salvando ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {salvando ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #ffffff40",
                          borderTop: "2px solid #ffffff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Salvando...
                    </>
                  ) : sucessoSalvar ? (
                    <>
                      <span>✓</span>
                      Salvo!
                    </>
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

export function Odontograma() {
  const [modalAberto, setModalAberto] = useState(false);
  const [denteSelecionado, setDenteSelecionado] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [comentarioAtual, setComentarioAtual] = useState("");

  useEffect(() => {
    const svg = document.querySelector("svg");
    if (!svg) return;

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
