export default function CasoDescricao({ descricao }) {
  const descricaoPadrao = `No dia 15 de fevereiro de 2024, um incêndio destruiu uma residência no bairro Santa Efigênia, na zona leste da zona. Durante a perícia, foram encontrados restos mortais carbonizados, impossibilitando a identificação visual da vítima. A polícia solicitou exames odontológicos para comparação de registros dentários e tentativa de identificação da vítima.`;

  return (
    <div className="descricao-coluna">
      <h2>Descrição do Caso</h2>
      <div className="descricao-content">
        <p>{descricao || descricaoPadrao}</p>
      </div>
    </div>
  );
}
