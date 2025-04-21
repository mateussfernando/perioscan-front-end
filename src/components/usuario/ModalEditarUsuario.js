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

      // Verificar se a URL está correta
      const url = `https://perioscan-back-end-fhhq.onrender.com/api/users/${userId}`;
      console.log("URL da requisição:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        // Tentar obter detalhes do erro
        let errorMessage = `Erro ao atualizar usuário: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Se não conseguir obter o JSON, usa a mensagem padrão
        }
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      console.log("Usuário atualizado com sucesso:", updatedUser);
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
