// pages/casos

import "../styles/casos.css";
import AsideNavbar from "@/components/AsideNavBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";

export default function MainCasos() {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      router.push('/login');
      return;
    }
  
    async function fetchCasos() {
      try {
        console.log("Iniciando busca de casos...");
        
        const response = await fetch("https://perioscan-back-end-fhhq.onrender.com/api/cases", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        console.log("Resposta recebida:", response);
  
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }
  
        if (response.status === 404) {
          setError("Endpoint não encontrado (404) - Verifique a URL da API");
          setCasos([]);
          return;
        }
  
        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
  
        const textData = await response.text();
        const data = textData ? JSON.parse(textData) : [];
  
        console.log("Dados recebidos:", data);
        
        setCasos(Array.isArray(data) ? data : []);
        setError(null);
  
      } catch (error) {
        console.error("Erro completo:", error);
        setError(`Falha ao carregar casos: ${error.message}`);
        setCasos([]);
      } finally {
        setLoading(false);
      }
    }
  
    fetchCasos();
  }, [router]);


  const formatarData = (dataISO) => {
    if (!dataISO) return "--";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="main-conteiner-casos">
      <AsideNavbar />

      <div className="container-casos">
        <div className="header-casos">
          <h2>Página de Casos</h2>
          <div className="input-casos">
            <input type="text" placeholder="Buscar caso" />
            <Search/>
          </div>
        </div>

        <div className="top-bar-casos">
          <button className="btn-novo-caso">Novo caso</button>
        </div>

        <div className="tabela-container">
          <table className="tabela-casos">
            <thead>
              <tr>
                <th>Título</th>
                <th>Local</th>
                <th>Data abertura</th>
                <th>Data fechamento</th>
                <th>Criado por:</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Carregando casos...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6">Erro ao carregar casos: {error}</td>
                </tr>
              ) : casos.length === 0 ? (
                <tr>
                  <td colSpan="6">Nenhum caso encontrado.</td>
                </tr>
              ) : (
                casos.map((caso) => (
                  <tr key={caso.id}>
                    <td>{caso.title || "--"}</td>
                    <td>{caso.location || "--"}</td>
                    <td>{formatarData(caso.openDate)}</td>
                    <td>{formatarData(caso.closeDate)}</td>
                    <td>{caso.createdBy || "--"}</td>
                    <td>
                      <span className={`status ${caso.status?.replace(/\s+/g, '-') || ''}`}>
                        {caso.status || "--"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}