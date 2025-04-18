"use client"

import "../styles/admin-cadastramento.css"
import { useState } from "react"
import AsideNavbar from "../components/AsideNavBar"
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader } from 'lucide-react'

export default function AdminCadastramento() {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "perito", // Valor padrão
  })

  // Estados para controle de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Manipula mudanças nos campos do formulário
  function handleChange(event) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }



  // Processa o envio do formulário
  async function handleSubmit(event) {
    event.preventDefault()
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido.")
      return
    }

    // Validação de senha
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Obter o token do localStorage
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("Você precisa estar autenticado para cadastrar usuários.")
      }

      const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar usuário")
      }

      setSuccess(`Usuário ${formData.name} cadastrado com sucesso!`)
      
      // Limpar o formulário após sucesso
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "perito",
      })
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error)
      setError(error.message || "Falha ao cadastrar usuário. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-container-admincadastramento">
      {/* Barra lateral de navegação */}
      <AsideNavbar />

      {/* Conteúdo principal da página */}
      <div className="admincadastramento-pagina">
        <div className="admincadastramento-conteudo-principal">
          <h1 className="admincadastramento-titulo">Cadastro de Usuário</h1>

          {/* Mensagens de feedback */}
          {error && (
            <div className="admincadastramento-mensagem error">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="admincadastramento-mensagem success">
              <CheckCircle size={20} />
              <p>{success}</p>
            </div>
          )}

          {/* Formulário de cadastro */}
          <form onSubmit={handleSubmit} className="admincadastramento-formulario">
            {/* Campo: Nome Completo */}
            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            {/* Campo: E-mail */}
            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@perioscan.com"
                required
              />
            </div>

            {/* Campo: Senha com gerador */}
            <div className="admincadastramento-grupo-formulario">
              <label htmlFor="password">Senha</label>
              <div className="admincadastramento-container-senha">
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite a senha"
                    required
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              
              </div>
            </div>

            {/* Campo: Cargo (radio buttons) */}
            <div className="admincadastramento-grupo-formulario">
              <label>Cargo</label>
              <div className="admincadastramento-opcoes-cargo">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="perito"
                    checked={formData.role === "perito"}
                    onChange={handleChange}
                    required
                  />
                  <span>Perito</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="assistente"
                    checked={formData.role === "assistente"}
                    onChange={handleChange}
                  />
                  <span>Assistente</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                  />
                  <span>Administrador</span>
                </label>
              </div>
            </div>

            {/* Botão de Cadastrar */}
            <div className="admincadastramento-acoes-formulario">
              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  "Cadastrar Usuário"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}