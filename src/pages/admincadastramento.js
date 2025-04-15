// pages/admincadastramento.tsx
import "../styles/admin-cadastramento.css";
import { useState } from "react";
import AsideNavbar from "../components/AsideNavBar";

export default function AdminCadastramento() {
  // Estado para armazenar os dados do formulário
  const [dadosFormulario, setDadosFormulario] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    dataNascimento: "",
    cpf: "",
    instituicao: "",
    cargo: "",
  });

  // Gera uma senha numérica aleatória com 11 dígitos
  function gerarSenhaAleatoria() {
    let senha = "";
    for (let i = 0; i < 11; i++) {
      senha += Math.floor(Math.random() * 10);
    }
    setDadosFormulario({ ...dadosFormulario, senha });
  }

  // Manipula mudanças nos campos do formulário
  function manipularMudanca(evento) {
    const { name, value } = evento.target;
    setDadosFormulario({ ...dadosFormulario, [name]: value });
  }

  // Processa o envio do formulário
  async function manipularEnvio(evento) {
    evento.preventDefault();
    
    try {
      const response = await fetch('https://perioscan-back-end-fhhq.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: dadosFormulario.email,
          senha: dadosFormulario.senha
        })
      });
  
      if (!response.ok) throw new Error('Erro no login');
      
      const { token } = await response.json();
      localStorage.setItem('authToken', token);
      alert("Login realizado com sucesso!");
      window.location.href = '/casos'; // Redireciona para a página de casos
      
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Falha no login: " + error.message);
    }
  }

  return (
    <div className="main-container-admincadastramento">
      {/* Barra lateral de navegação */}
      <AsideNavbar></AsideNavbar>

      {/* Conteúdo principal da página */}
      <div className="admincadastramento-pagina">
        <div className="admincadastramento-conteudo-principal">
          <h1 className="admincadastramento-titulo">Cadastro de Usuário</h1>

          {/* Formulário de cadastro */}
          <form
            onSubmit={manipularEnvio}
            className="admincadastramento-formulario"
          >
            {/* Campo: Nome Completo */}
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

            {/* Campo: E-mail */}
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

            {/* Campo: Senha com gerador */}
            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="senha">Senha:</label>
              <div className="admincadastramento-container-senha">
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={dadosFormulario.senha}
                  onChange={manipularMudanca}
                  required
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            {/* Campo: CPF */}
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

            {/* Campo: Cargo (radio buttons) */}
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

            {/* Botão de Cadastrar */}
            <div className="admincadastramento-acoes-formulario">
              <button type="submit">Cadastrar Usuário</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
