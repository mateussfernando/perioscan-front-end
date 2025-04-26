export default function CasoInfoGeral({ caso }) {
  // Função para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return "--";
    const data = new Date(dataISO);
    const dataAjustada = new Date(
      data.getTime() + data.getTimezoneOffset() * 60000
    );
    return dataAjustada.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para formatar o tipo do caso
  const formatarTipoCaso = (tipo) => {
    if (!tipo) return "Outro";
    const tipos = {
      acidente: "Acidente",
      "identificação de vítima": "Identificação de Vítima",
      "exame criminal": "Exame Criminal",
      outro: "Outro",
    };
    return tipos[tipo] || tipo;
  };

  // Função para obter a classe CSS baseada no status
  const getStatusClassName = (status) => {
    if (!status) return "status-desconhecido";
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
    switch (normalizedStatus) {
      case "em-andamento":
        return "status-em-andamento";
      case "finalizado":
        return "status-finalizado";
      case "pendente":
        return "status-pendente";
      case "arquivado":
        return "status-arquivado";
      case "cancelado":
        return "status-cancelado";
      default:
        return "status-outro";
    }
  };

  return (
    <div className="info-section">
      <h2>Informações Gerais</h2>
      <div className="info-item">
        <strong>ID do Caso:</strong>{" "}
        {caso._id || caso.id || "ID não disponível"}
      </div>
      <div className="info-item">
        <strong>Título:</strong> {caso.title}
      </div>
      <div className="info-item">
        <strong>Data de Abertura:</strong>{" "}
        {formatarData(caso.openDate) || "Não informada"}
      </div>
      <div className="info-item">
        <strong>Data da Ocorrência:</strong>{" "}
        {formatarData(caso.occurrenceDate) || "Não informada"}
      </div>
      <div className="info-item">
        <strong>Local:</strong> {caso.location || "Belo Horizonte, MG"}
      </div>
      <div className="info-item">
        <strong>Status:</strong>{" "}
        <span className={getStatusClassName(caso.status)}>
          {caso.status || "Em Andamento"}
        </span>
      </div>
      <div className="info-item">
        <strong>Criado por:</strong> {caso.createdBy?.name || "Não informado"}
      </div>
      <div className="info-item">
        <strong>Tipo:</strong> {formatarTipoCaso(caso.type) || "Outro"}
      </div>
    </div>
  );
}
