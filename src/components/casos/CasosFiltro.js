"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react"

export default function CasosFiltro({ onSearch, onFilter }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    dataInicio: "",
    dataFim: "",
    criadoPor: "",
  })

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    const updatedFilters = { ...filters, [name]: value }
    setFilters(updatedFilters)
    onFilter(updatedFilters)
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      dataInicio: "",
      dataFim: "",
      criadoPor: "",
    })
    onFilter({
      status: "",
      dataInicio: "",
      dataFim: "",
      criadoPor: "",
    })
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="casos-filtro">
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar caso por título ou local..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => handleSearchChange({ target: { value: "" } })}>
              <X size={16} />
            </button>
          )}
        </div>
        <button className="filter-toggle" onClick={toggleFilters}>
          <Filter size={18} />
          <span>Filtros</span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="em andamento">Em Andamento</option>
              <option value="finalizado">Finalizado</option>
              <option value="pendente">Pendente</option>
              <option value="arquivado">Arquivado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dataInicio">Data Abertura (Início)</label>
            <input
              type="date"
              id="dataInicio"
              name="dataInicio"
              value={filters.dataInicio}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="dataFim">Data Abertura (Fim)</label>
            <input type="date" id="dataFim" name="dataFim" value={filters.dataFim} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label htmlFor="criadoPor">Criado por</label>
            <input
              type="text"
              id="criadoPor"
              name="criadoPor"
              value={filters.criadoPor}
              onChange={handleFilterChange}
              placeholder="Nome do usuário"
            />
          </div>

          <button className="clear-filters" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  )
}
