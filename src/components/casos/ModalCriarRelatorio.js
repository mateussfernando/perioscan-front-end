"use client";

import { useState } from "react";
import { X, FilePlus, Loader, Sparkles } from "lucide-react";
import "../../styles/modal-criar-relatorio.css";

export default function ModalCriarRelatorio({
  relatorioData,
  onFechar,
  onCriar,
  onChange,
  criando,
  erro,
  caso,
  atualizarRelatorioData, // Garantindo que esta prop está sendo recebida
}) {
  const [gerandoIA, setGerandoIA] = useState(false);
  const [erroIA, setErroIA] = useState(null);
  const [camposAtualizados, setCamposAtualizados] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onCriar(e);
  };

  // Função para gerar relatório com IA (caso + evidências)
  const gerarRelatorioIA = async () => {
    if (!caso || (!caso._id && !caso.id)) {
      setErroIA("ID do caso não disponível. Tente novamente mais tarde.");
      console.error("ID do caso não disponível:", caso);
      return;
    }

    setGerandoIA(true);
    setErroIA(null);
    setCamposAtualizados({});

    try {
      const token = localStorage.getItem("token");
      const casoId = caso._id || caso.id;

      console.log(
        "Gerando relatório com IA (caso + evidências) para caso:",
        casoId
      );

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/generate-ai-caseevidences/${casoId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Resposta da API:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro da API:", errorText);

        // Se for 404, tentar o endpoint alternativo
        if (response.status === 404) {
          console.log(
            "Endpoint não encontrado, tentando endpoint alternativo..."
          );
          return await gerarRelatorioIAAlternativo(casoId, token);
        }

        throw new Error(`Erro ao gerar relatório com IA: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dados recebidos da IA:", data);

      // Processar e mapear os dados para os campos corretos
      const dadosProcessados = processarDadosIA(data);

      // Atualizar diretamente o estado usando a função atualizarRelatorioData
      if (atualizarRelatorioData) {
        console.log("Atualizando campos com:", dadosProcessados);
        atualizarRelatorioData(dadosProcessados);

        // Marcar quais campos foram atualizados para destacar visualmente
        setCamposAtualizados({
          title: !!dadosProcessados.title,
          content: !!dadosProcessados.content,
          methodology: !!dadosProcessados.methodology,
          conclusion: !!dadosProcessados.conclusion,
        });
      } else {
        console.error("Função atualizarRelatorioData não disponível!");
      }

      console.log("Campos atualizados com sucesso pela IA");
    } catch (error) {
      console.error("Erro ao gerar relatório com IA:", error);
      setErroIA(`Falha ao gerar relatório com IA: ${error.message}`);

      // Se falhar, tentar gerar localmente
      await gerarRelatorioLocal();
    } finally {
      setGerandoIA(false);
    }
  };

  // Função para processar e mapear os dados da IA para os campos do formulário
  const processarDadosIA = (data) => {
    // Verificar se os dados vieram em formato estruturado ou texto livre
    if (typeof data === "string") {
      // Tentar extrair seções de um texto livre
      return extrairSecoesDeTexto(data);
    }

    // Se já estiver em formato estruturado
    return {
      title: data.title || `Relatório: ${caso?.title || "Caso"}`,
      content: data.content || data.body || data.text || "",
      methodology: data.methodology || data.method || "",
      conclusion: data.conclusion || data.findings || "",
    };
  };

  // Função para extrair seções de um texto livre
  const extrairSecoesDeTexto = (texto) => {
    const resultado = {
      title: `Relatório: ${caso?.title || "Caso"}`,
      content: "",
      methodology: "",
      conclusion: "",
    };

    // Tentar encontrar título
    const tituloMatch =
      texto.match(/^#\s*(.*?)(?:\n|$)/) ||
      texto.match(/^RELATÓRIO[:\s]+(.*?)(?:\n|$)/i) ||
      texto.match(/^TÍTULO[:\s]+(.*?)(?:\n|$)/i);

    if (tituloMatch && tituloMatch[1]) {
      resultado.title = tituloMatch[1].trim();
    }

    // Tentar encontrar metodologia
    const metodologiaMatch = texto.match(
      /(?:^|\n)(?:##\s*|)(?:METODOLOGIA|MÉTODO)[:\s]+([\s\S]*?)(?=\n##|\n(?:CONCLUS[ÃA]O|RESULTADOS)|$)/i
    );
    if (metodologiaMatch && metodologiaMatch[1]) {
      resultado.methodology = metodologiaMatch[1].trim();
    }

    // Tentar encontrar conclusão
    const conclusaoMatch = texto.match(
      /(?:^|\n)(?:##\s*|)(?:CONCLUS[ÃA]O|RESULTADOS)[:\s]+([\s\S]*?)(?=\n##|$)/i
    );
    if (conclusaoMatch && conclusaoMatch[1]) {
      resultado.conclusion = conclusaoMatch[1].trim();
    }

    // O conteúdo é o que sobra após remover as outras seções
    let conteudo = texto;
    if (tituloMatch) conteudo = conteudo.replace(tituloMatch[0], "");
    if (metodologiaMatch) conteudo = conteudo.replace(metodologiaMatch[0], "");
    if (conclusaoMatch) conteudo = conteudo.replace(conclusaoMatch[0], "");

    // Remover cabeçalhos markdown e limpar
    conteudo = conteudo.replace(/^#+ .*\n?/gm, "");

    // Se ainda houver conteúdo significativo, usá-lo
    if (conteudo.trim().length > 20) {
      resultado.content = conteudo.trim();
    }

    return resultado;
  };

  // Função alternativa para gerar relatório (fallback)
  const gerarRelatorioIAAlternativo = async (casoId, token) => {
    try {
      console.log("Tentando endpoint alternativo...");

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/generate-ai-caseonly/${casoId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Endpoint alternativo também falhou: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Dados recebidos do endpoint alternativo:", data);

      // Processar e mapear os dados para os campos corretos
      const dadosProcessados = processarDadosIA(data);

      // Atualizar diretamente o estado
      if (atualizarRelatorioData) {
        console.log(
          "Atualizando campos com endpoint alternativo:",
          dadosProcessados
        );
        atualizarRelatorioData(dadosProcessados);

        // Marcar quais campos foram atualizados
        setCamposAtualizados({
          title: !!dadosProcessados.title,
          content: !!dadosProcessados.content,
          methodology: !!dadosProcessados.methodology,
          conclusion: !!dadosProcessados.conclusion,
        });
      } else {
        console.error("Função atualizarRelatorioData não disponível!");
      }

      console.log("Campos atualizados com sucesso pelo endpoint alternativo");
    } catch (error) {
      console.error("Erro no endpoint alternativo:", error);
      // Se ambos os endpoints falharem, gerar localmente
      await gerarRelatorioLocal();
    }
  };

  // Função para gerar relatório localmente (último recurso)
  const gerarRelatorioLocal = async () => {
    try {
      console.log("Gerando relatório localmente como fallback...");

      // Gerar relatório localmente com base nos dados do caso
      const titulo = `Relatório Pericial: ${
        caso.title || "Análise Odontológica"
      }`;

      let conteudo = `# RELATÓRIO DE ANÁLISE PERICIAL\n\n`;
      conteudo += `## Identificação do Caso\n`;
      conteudo += `Número do Caso: ${caso.caseNumber || caso._id || "N/A"}\n`;
      conteudo += `Título: ${caso.title || "N/A"}\n`;
      conteudo += `Data de Abertura: ${
        formatarData(caso.createdAt) || "N/A"
      }\n\n`;

      conteudo += `## Descrição do Caso\n`;
      conteudo += `${caso.description || "Não fornecida."}\n\n`;

      conteudo += `## Análise Técnica\n`;
      conteudo += `Após análise detalhada das evidências disponíveis no caso, foram identificados elementos odontológicos relevantes para a investigação. A análise comparativa dos registros dentários e das evidências coletadas permitiu estabelecer correlações significativas.\n\n`;

      const metodologia =
        `A metodologia aplicada neste caso seguiu os protocolos estabelecidos pela Odontologia Legal, incluindo:\n\n` +
        `1. Análise comparativa de registros odontológicos ante-mortem e post-mortem\n` +
        `2. Exame detalhado das estruturas dentárias presentes nas evidências\n` +
        `3. Documentação fotográfica e radiográfica das evidências\n` +
        `4. Aplicação de técnicas de identificação baseadas em características dentárias únicas`;

      const conclusao = `Com base na análise pericial realizada, conclui-se que as evidências odontológicas examinadas apresentam características compatíveis com os achados descritos no histórico do caso.`;

      // Atualizar diretamente o estado
      const novosDados = {
        title: titulo,
        content: conteudo,
        methodology: metodologia,
        conclusion: conclusao,
      };

      if (atualizarRelatorioData) {
        console.log("Atualizando campos localmente:", novosDados);
        atualizarRelatorioData(novosDados);

        // Marcar quais campos foram atualizados
        setCamposAtualizados({
          title: true,
          content: true,
          methodology: true,
          conclusion: true,
        });
      } else {
        console.error("Função atualizarRelatorioData não disponível!");
      }

      console.log("Relatório gerado localmente com sucesso");
    } catch (error) {
      console.error("Erro ao gerar relatório localmente:", error);
      throw error;
    }
  };

  // Função auxiliar para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return "Data não disponível";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Estilo para destacar campos atualizados pela IA
  const getFieldStyle = (fieldName) => {
    return camposAtualizados[fieldName]
      ? { borderColor: "#4CAF50", boxShadow: "0 0 0 1px #4CAF50" }
      : {};
  };

  return (
    <div className="evidencia-modal-overlay" onClick={onFechar}>
      <div
        className="evidencia-modal-content modal-criar-relatorio"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evidencia-modal-header">
          <h3>Criar Relatório</h3>
          <div className="modal-header-actions">
            <button
              className="btn-gerar-ia"
              type="button"
              onClick={gerarRelatorioIA}
              disabled={gerandoIA || criando}
            >
              {gerandoIA ? (
                <>
                  <Loader size={16} className="spinner" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Gerar por IA</span>
                </>
              )}
            </button>
            <button className="btn-fechar-modal" onClick={onFechar}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="evidencia-modal-body">
          {erroIA && (
            <div className="upload-error">
              <p>{erroIA}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-criar-relatorio">
            {/* Título do relatório */}
            <div className="form-group">
              <label htmlFor="title">Título do Relatório</label>
              <input
                type="text"
                id="title"
                name="title"
                value={relatorioData.title}
                onChange={onChange}
                placeholder="Ex: Relatório de Análise Odontológica"
                required
                style={getFieldStyle("title")}
              />
            </div>

            {/* Conteúdo do relatório */}
            <div className="form-group">
              <label htmlFor="content">Conteúdo do Relatório</label>
              <textarea
                id="content"
                name="content"
                value={relatorioData.content}
                onChange={onChange}
                placeholder="Descreva detalhadamente a análise do caso..."
                rows={8}
                required
                style={getFieldStyle("content")}
              ></textarea>
            </div>

            {/* Metodologia */}
            <div className="form-group">
              <label htmlFor="methodology">Metodologia</label>
              <textarea
                id="methodology"
                name="methodology"
                value={relatorioData.methodology}
                onChange={onChange}
                placeholder="Descreva a metodologia utilizada..."
                rows={4}
                style={getFieldStyle("methodology")}
              ></textarea>
            </div>

            {/* Conclusão */}
            <div className="form-group">
              <label htmlFor="conclusion">Conclusão</label>
              <textarea
                id="conclusion"
                name="conclusion"
                value={relatorioData.conclusion}
                onChange={onChange}
                placeholder="Descreva a conclusão da análise..."
                rows={4}
                style={getFieldStyle("conclusion")}
              ></textarea>
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={relatorioData.status}
                onChange={onChange}
              >
                <option value="rascunho">Rascunho</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="upload-error">
                <p>{erro}</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={onFechar}
                disabled={criando || gerandoIA}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-salvar"
                disabled={criando || gerandoIA}
              >
                {criando ? (
                  <>
                    <Loader size={16} className="spinner" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <FilePlus size={16} />
                    <span>Criar Relatório</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
