import { useState } from "react";
import { X, Save, Loader, UserPlus } from "lucide-react";
import "../../styles/modal-adicionar-vitima.css";

export default function ModalAdicionarVitima({ onFechar, onSalvar, salvando, erro, inline }) {
  const [form, setForm] = useState({
    name: "",
    identificationType: "",
    referenceCode: "",
    document: { number: "", type: "" },
    nic: "",
    gender: "",
    age: "",
    birthDate: "",
    ethnicity: "não_declarada",
    estimatedAge: { min: "", max: "", methodology: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("document.")) {
      setForm((prev) => ({
        ...prev,
        document: { ...prev.document, [name.split(".")[1]]: value },
      }));
    } else if (name.startsWith("estimatedAge.")) {
      setForm((prev) => ({
        ...prev,
        estimatedAge: { ...prev.estimatedAge, [name.split(".")[1]]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(form);
  };

  if (inline) {
    return (
      <form className="form-adicionar-vitima" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="identificationType">Tipo de Identificação</label>
          <select
            id="identificationType"
            name="identificationType"
            value={form.identificationType}
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            <option value="identificada">Identificada</option>
            <option value="não_identificada">Não Identificada</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="name">Nome da Vítima</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nome completo da vítima"
            required={form.identificationType === "identificada"}
            maxLength={200}
          />
        </div>
        <div className="form-group">
          <label htmlFor="nic">NIC (Número de Identificação Criminal)</label>
          <input
            type="text"
            id="nic"
            name="nic"
            value={form.nic}
            onChange={handleChange}
            placeholder="Número de identificação criminal"
          />
        </div>
        {form.identificationType === "não_identificada" && (
          <div className="form-group">
            <label htmlFor="referenceCode">Código de Referência</label>
            <input
              type="text"
              id="referenceCode"
              name="referenceCode"
              value={form.referenceCode}
              onChange={handleChange}
              placeholder="Código de referência para vítima não identificada"
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="gender">Gênero</label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="indeterminado">Indeterminado</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="age">Idade</label>
          <input
            type="number"
            id="age"
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="Idade da vítima"
            min="0"
            max="150"
          />
        </div>
        <div className="form-group">
          <label htmlFor="birthDate">Data de Nascimento</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="ethnicity">Etnia</label>
          <select
            id="ethnicity"
            name="ethnicity"
            value={form.ethnicity}
            onChange={handleChange}
          >
            <option value="não_declarada">Não Declarada</option>
            <option value="branca">Branca</option>
            <option value="preta">Preta</option>
            <option value="parda">Parda</option>
            <option value="amarela">Amarela</option>
            <option value="indígena">Indígena</option>
            <option value="não_identificada">Não Identificada</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="document.type">Tipo de Documento</label>
          <select
            id="document.type"
            name="document.type"
            value={form.document.type}
            onChange={handleChange}
          >
            <option value="">Selecione...</option>
            <option value="cpf">CPF</option>
            <option value="rg">RG</option>
            <option value="cnh">CNH</option>
            <option value="passaporte">Passaporte</option>
            <option value="certidao_nascimento">Certidão de Nascimento</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="document.number">Número do Documento</label>
          <input
            type="text"
            id="document.number"
            name="document.number"
            value={form.document.number}
            onChange={handleChange}
            placeholder="Número do documento"
            maxLength={50}
          />
        </div>
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="estimatedAge.min">Idade Estimada (Mín)</label>
            <input
              type="number"
              id="estimatedAge.min"
              name="estimatedAge.min"
              value={form.estimatedAge.min}
              onChange={handleChange}
              placeholder="Idade mínima"
              min="0"
              max="150"
            />
          </div>
          <div className="form-group">
            <label htmlFor="estimatedAge.max">Idade Estimada (Máx)</label>
            <input
              type="number"
              id="estimatedAge.max"
              name="estimatedAge.max"
              value={form.estimatedAge.max}
              onChange={handleChange}
              placeholder="Idade máxima"
              min="0"
              max="150"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="estimatedAge.methodology">Metodologia da Idade Estimada</label>
          <textarea
            id="estimatedAge.methodology"
            name="estimatedAge.methodology"
            value={form.estimatedAge.methodology}
            onChange={handleChange}
            placeholder="Descreva a metodologia utilizada para estimar a idade"
            rows={3}
          />
        </div>
        {erro && (
          <div className="upload-error">
            <p>{erro}</p>
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn-cancelar" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn-salvar" disabled={salvando}>
            {salvando ? (
              <>
                <Loader size={16} className="spinner" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Salvar Vítima</span>
              </>
            )}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="vitima-modal-overlay" onClick={onFechar}>
      <div className="vitima-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vitima-modal-header">
          <h3><UserPlus size={20} style={{marginRight: 8}}/>Adicionar Vítima</h3>
          <button className="btn-fechar-modal" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>
        <div className="vitima-modal-body">
          <form className="form-adicionar-vitima" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identificationType">Tipo de Identificação</label>
              <select
                id="identificationType"
                name="identificationType"
                value={form.identificationType}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="identificada">Identificada</option>
                <option value="não_identificada">Não Identificada</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="name">Nome da Vítima</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nome completo da vítima"
                required={form.identificationType === "identificada"}
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nic">NIC (Número de Identificação Criminal)</label>
              <input
                type="text"
                id="nic"
                name="nic"
                value={form.nic}
                onChange={handleChange}
                placeholder="Número de identificação criminal"
              />
            </div>
            {form.identificationType === "não_identificada" && (
              <div className="form-group">
                <label htmlFor="referenceCode">Código de Referência</label>
                <input
                  type="text"
                  id="referenceCode"
                  name="referenceCode"
                  value={form.referenceCode}
                  onChange={handleChange}
                  placeholder="Código de referência para vítima não identificada"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="gender">Gênero</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="indeterminado">Indeterminado</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="age">Idade</label>
              <input
                type="number"
                id="age"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Idade da vítima"
                min="0"
                max="150"
              />
            </div>
            <div className="form-group">
              <label htmlFor="birthDate">Data de Nascimento</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ethnicity">Etnia</label>
              <select
                id="ethnicity"
                name="ethnicity"
                value={form.ethnicity}
                onChange={handleChange}
              >
                <option value="não_declarada">Não Declarada</option>
                <option value="branca">Branca</option>
                <option value="preta">Preta</option>
                <option value="parda">Parda</option>
                <option value="amarela">Amarela</option>
                <option value="indígena">Indígena</option>
                <option value="não_identificada">Não Identificada</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="document.type">Tipo de Documento</label>
              <select
                id="document.type"
                name="document.type"
                value={form.document.type}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="cpf">CPF</option>
                <option value="rg">RG</option>
                <option value="cnh">CNH</option>
                <option value="passaporte">Passaporte</option>
                <option value="certidao_nascimento">Certidão de Nascimento</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="document.number">Número do Documento</label>
              <input
                type="text"
                id="document.number"
                name="document.number"
                value={form.document.number}
                onChange={handleChange}
                placeholder="Número do documento"
                maxLength={50}
              />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="estimatedAge.min">Idade Estimada (Mín)</label>
                <input
                  type="number"
                  id="estimatedAge.min"
                  name="estimatedAge.min"
                  value={form.estimatedAge.min}
                  onChange={handleChange}
                  placeholder="Idade mínima"
                  min="0"
                  max="150"
                />
              </div>
              <div className="form-group">
                <label htmlFor="estimatedAge.max">Idade Estimada (Máx)</label>
                <input
                  type="number"
                  id="estimatedAge.max"
                  name="estimatedAge.max"
                  value={form.estimatedAge.max}
                  onChange={handleChange}
                  placeholder="Idade máxima"
                  min="0"
                  max="150"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="estimatedAge.methodology">Metodologia da Idade Estimada</label>
              <textarea
                id="estimatedAge.methodology"
                name="estimatedAge.methodology"
                value={form.estimatedAge.methodology}
                onChange={handleChange}
                placeholder="Descreva a metodologia utilizada para estimar a idade"
                rows={3}
              />
            </div>
            {erro && (
              <div className="upload-error">
                <p>{erro}</p>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={onFechar} disabled={salvando}>
                Cancelar
              </button>
              <button type="submit" className="btn-salvar" disabled={salvando}>
                {salvando ? (
                  <>
                    <Loader size={16} className="spinner" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Salvar Vítima</span>
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