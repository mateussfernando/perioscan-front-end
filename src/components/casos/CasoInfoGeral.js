export default function CasoInfoGeral({ caso }) {
  // Função para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return "--"
    const data = new Date(dataISO)
    const dataAjustada = new Date(data.getTime() + data.getTimezoneOffset() * 60000)
    return dataAjustada.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Função para formatar o tipo do caso
  const formatarTipoCaso = (tipo) => {
    if (!tipo) return "Outro"
    const tipos = {
      acidente: "Acidente",
      "identificação de vítima": "Identificação de Vítima",
      "exame criminal": "Exame Criminal",
      outro: "Outro",
    }
    return tipos[tipo] || tipo
  }

  // Função para obter a classe CSS baseada no status
  const getStatusClassName = (status) => {
    if (!status) return "status-desconhecido"
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-")
    switch (normalizedStatus) {
      case "em-andamento":
        return "status-em-andamento"
      case "finalizado":
        return "status-finalizado"
      case "pendente":
        return "status-pendente"
      case "arquivado":
        return "status-arquivado"
      case "cancelado":
        return "status-cancelado"
      default:
        return "status-outro"
    }
  }

  // Função para formatar o tipo de documento
  const formatarTipoDocumento = (tipo) => {
    if (!tipo) return "Não informado"
    const tipos = {
      cpf: "CPF",
      rg: "RG",
      cnh: "CNH",
      passaporte: "Passaporte",
      certidao_nascimento: "Certidão de Nascimento",
      outro: "Outro",
    }
    return tipos[tipo] || tipo
  }

  // Função para formatar etnia
  const formatarEtnia = (etnia) => {
    if (!etnia) return "Não declarada"
    const etnias = {
      branca: "Branca",
      preta: "Preta",
      parda: "Parda",
      amarela: "Amarela",
      indígena: "Indígena",
      não_declarada: "Não Declarada",
      não_identificada: "Não Identificada",
    }
    return etnias[etnia] || etnia
  }

  // Função para formatar gênero
  const formatarGenero = (genero) => {
    if (!genero) return "Não informado"
    const generos = {
      masculino: "Masculino",
      feminino: "Feminino",
      indeterminado: "Indeterminado",
    }
    return generos[genero] || genero
  }

  // Função para formatar tipo de identificação
  const formatarTipoIdentificacao = (tipo) => {
    if (!tipo) return "Não informado"
    const tipos = {
      identificada: "Identificada",
      não_identificada: "Não Identificada",
    }
    return tipos[tipo] || tipo
  }

  return (
    <div className="info-section">
      <h2>Informações Gerais</h2>
      <div className="info-item">
        <strong>ID do Caso:</strong> {caso._id || caso.id || "ID não disponível"}
      </div>
      <div className="info-item">
        <strong>Título:</strong> {caso.title}
      </div>
      <div className="info-item">
        <strong>Data de Abertura:</strong> {formatarData(caso.openDate) || "Não informada"}
      </div>
      <div className="info-item">
        <strong>Data da Ocorrência:</strong> {formatarData(caso.occurrenceDate) || "Não informada"}
      </div>
      <div className="info-item">
        <strong>Local:</strong> {caso.location || "Belo Horizonte, MG"}
      </div>
      <div className="info-item">
        <strong>Status:</strong>{" "}
        <span className={getStatusClassName(caso.status)}>{caso.status || "Em Andamento"}</span>
      </div>
      <div className="info-item">
        <strong>Criado por:</strong> {caso.createdBy?.name || "Não informado"}
      </div>
      <div className="info-item">
        <strong>Tipo:</strong> {formatarTipoCaso(caso.type) || "Outro"}
      </div>
      {/* Seção de Informações da Vítima */}
      {caso.victim && (
        <div className="info-section victim-section">
          <h2>Informações da Vítima</h2>

          <div className="info-item">
            <strong>Tipo de Identificação:</strong>{" "}
            <span className={`identificacao-${caso.victim.identificationType?.replace("_", "-")}`}>
              {formatarTipoIdentificacao(caso.victim.identificationType)}
            </span>
          </div>

          <div className="info-item">
            <strong>Nome:</strong> {caso.victim.name || "Não informado"}
          </div>

          {caso.victim.nic && (
            <div className="info-item">
              <strong>NIC:</strong> {caso.victim.nic}
            </div>
          )}

          {caso.victim.referenceCode && (
            <div className="info-item">
              <strong>Código de Referência:</strong> {caso.victim.referenceCode}
            </div>
          )}

          <div className="info-item">
            <strong>Gênero:</strong> {formatarGenero(caso.victim.gender)}
          </div>

          {caso.victim.age && (
            <div className="info-item">
              <strong>Idade:</strong> {caso.victim.age} anos
            </div>
          )}

          {caso.victim.birthDate && (
            <div className="info-item">
              <strong>Data de Nascimento:</strong> {formatarData(caso.victim.birthDate)}
            </div>
          )}

          {(caso.victim.estimatedAge?.min || caso.victim.estimatedAge?.max) && (
            <div className="info-item">
              <strong>Idade Estimada:</strong>{" "}
              {caso.victim.estimatedAge.min && caso.victim.estimatedAge.max
                ? `${caso.victim.estimatedAge.min} - ${caso.victim.estimatedAge.max} anos`
                : caso.victim.estimatedAge.min
                  ? `A partir de ${caso.victim.estimatedAge.min} anos`
                  : `Até ${caso.victim.estimatedAge.max} anos`}
            </div>
          )}

          {caso.victim.estimatedAge?.methodology && (
            <div className="info-item">
              <strong>Metodologia da Idade Estimada:</strong> {caso.victim.estimatedAge.methodology}
            </div>
          )}

          <div className="info-item">
            <strong>Etnia:</strong> {formatarEtnia(caso.victim.ethnicity)}
          </div>

          {caso.victim.document?.type && (
            <div className="info-item">
              <strong>Documento:</strong> {formatarTipoDocumento(caso.victim.document.type)}
              {caso.victim.document.number && ` - ${caso.victim.document.number}`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
