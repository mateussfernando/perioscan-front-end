// pages/admincadastramento.tsx
import "../styles/admin-cadastramento.css";
import { useState } from "react";
import Layout from "../app/layout.js"

export default function AdminCadastramento() {
  const [dadosFormulario, setDadosFormulario] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    dataNascimento: "",
    cpf: "",
    instituicao: "",
    cargo: "",
  });

  const gerarSenhaAleatoria = () => {
    let senha = "";
    for (let i = 0; i < 12; i++) {
      senha += Math.floor(Math.random() * 10);
    }
    setDadosFormulario({ ...dadosFormulario, senha });
  };

  const manipularMudanca = (evento) => {
    const { name, value } = evento.target;
    setDadosFormulario({ ...dadosFormulario, [name]: value });
  };

  const manipularEnvio = (evento) => {
    evento.preventDefault();
    console.log("Dados do formulário:", dadosFormulario);
    alert("Usuário cadastrado com sucesso!");
  };

  return (
    <div>
      <Layout></Layout>
      <div className="admincadastramento-pagina">
        <div className="admincadastramento-conteudo-principal">
          <h1 className="admincadastramento-titulo">Cadastro de Usuário</h1>

          <form
            onSubmit={manipularEnvio}
            className="admincadastramento-formulario"
          >
            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="nomeCompleto">Nome Completo:</label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                value={dadosFormulario.nomeCompleto}
                onChange={manipularMudanca}
                required
              />
            </div>

            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={dadosFormulario.email}
                onChange={manipularMudanca}
                required
              />
            </div>

            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="senha">Senha:</label>
              <div className="admincadastramento-container-senha">
                <input
                  type="text"
                  id="senha"
                  name="senha"
                  value={dadosFormulario.senha}
                  onChange={manipularMudanca}
                  required
                  readOnly
                />
                <button type="button" onClick={gerarSenhaAleatoria}>
                  Gerar Senha
                </button>
              </div>
            </div>

            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="cpf">CPF:</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={dadosFormulario.cpf}
                onChange={manipularMudanca}
                required
                placeholder="000.000.000-00"
              />
            </div>

            <div className="admincadastramento-grupo-formulario">
              <label>Cargo:</label>
              <div className="admincadastramento-opcoes-cargo">
                <label>
                  <input
                    type="radio"
                    name="cargo"
                    value="perito"
                    checked={dadosFormulario.cargo === "perito"}
                    onChange={manipularMudanca}
                    required
                  />
                  Perito
                </label>
                <label>
                  <input
                    type="radio"
                    name="cargo"
                    value="assistente"
                    checked={dadosFormulario.cargo === "assistente"}
                    onChange={manipularMudanca}
                  />
                  Assistente
                </label>
              </div>
            </div>

            <div className="admincadastramento-acoes-formulario">
              <button type="submit">Cadastrar Usuário</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
