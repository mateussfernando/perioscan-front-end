"use client";

import { useState, useEffect } from "react";
import "../../styles/modal-editar-usuario.css";

export default function ModalEditarUsuario({ usuario, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usuario) {
      setFormData({
        name: usuario.name || "",
        email: usuario.email || "",
        role: usuario.role || "assistente",
        active: usuario.active !== false, // Se for undefined, assume true
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Modificar a função handleSubmit para corrigir o problema de 404
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      // Obter o ID do usuário (pode estar em _id ou id)
      const userId = usuario._id || usuario.id;

      console.log("Atualizando usuário com ID:", userId);
      console.log("Dados a serem enviados:", formData);

      // Verificar se temos um ID válido
      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Verificar a estrutura da URL - Ajustar conforme a API espera
      // Alguns backends esperam o ID sem o prefixo, vamos tentar remover se começar com algum prefixo comum
      let cleanId = userId;
      if (typeof userId === "string") {
        // Remover prefixos comuns se existirem
        if (userId.startsWith("user_")) {
          cleanId = userId.substring(5);
        } else if (userId.startsWith("usr_")) {
          cleanId = userId.substring(4);
        }
      }

      const url = `https://perioscan-back-end-fhhq.onrender.com/api/users/${cleanId}`;
      console.log("URL da requisição:", url);

      // Adicionar logs detalhados para depuração
      console.log("Enviando requisição PATCH para:", url);
      console.log("Headers:", {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.substring(0, 10)}...`, // Mostrar apenas parte do token por segurança
      });
      console.log("Body:", JSON.stringify(formData));

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("Status da resposta:", response.status);
      console.log(
        "Headers da resposta:",
        Object.fromEntries([...response.headers.entries()])
      );

      // Se a resposta for 404, tentar uma abordagem alternativa
      if (response.status === 404) {
        console.log("Tentando URL alternativa devido a 404...");

        // Tentar com PUT em vez de PATCH
        const altResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (altResponse.ok) {
          console.log("Método PUT funcionou!");
          const updatedUser = await altResponse.json();
          console.log("Usuário atualizado com sucesso:", updatedUser);

          // Garantir que o ID original seja preservado
          if (userId) {
            updatedUser._id = userId;
            updatedUser.id = userId;
          }

          onSave(updatedUser);
          onClose();
          return;
        } else {
          console.log("Método alternativo também falhou:", altResponse.status);
        }
      }

      if (!response.ok) {
        // Tentar obter detalhes do erro
        let errorMessage = `Erro ao atualizar usuário: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("Detalhes do erro:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Se não conseguir ler o corpo da resposta, usa a mensagem padrão
          console.error("Não foi possível ler detalhes do erro:", e);
        }
        throw new Error(errorMessage);
      }

      // Tentar obter a resposta como JSON
      let updatedUser;
      try {
        updatedUser = await response.json();
        console.log("Usuário atualizado com sucesso:", updatedUser);
      } catch (e) {
        console.warn("Resposta não é JSON válido, usando dados do formulário");
        // Se não conseguir obter JSON, criar um objeto com os dados do formulário
        updatedUser = {
          ...usuario, // Manter dados originais como ID
          ...formData, // Sobrescrever com os dados atualizados
        };
      }

      // Garantir que o ID original seja preservado
      if (userId) {
        updatedUser._id = userId;
        updatedUser.id = userId;
      }

      onSave(updatedUser);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Usuário</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Cargo</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Administrador</option>
              <option value="perito">Perito</option>
              <option value="assistente">Assistente</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Usuário ativo
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
