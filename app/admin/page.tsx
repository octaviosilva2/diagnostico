"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const LABELS: Record<string, string> = {
  empresa: "Empresa", nome: "Responsável", produto: "Produto/Serviço",
  tamanho: "Tamanho da equipe", tempo: "Tempo de mercado",
  q1: "Canais de contato", q2: "Quem responde", q3: "Tempo de resposta",
  q4: "Fora do horário", q5: "Métrica de conversão", q6: "Perdeu cliente por demora",
  q7: "Processo de venda", q8: "Etapa que toma mais tempo", q9: "Etapa que trava",
  q10: "Tarefas desnecessárias",
  q11: "Controle de pedidos", q12: "Acesso a números", q13: "Tarefas repetitivas diárias",
  q14: "Uso de tecnologia anterior",
  q15: "Contato pós-venda", q16: "Pedido de avaliação", q17: "Clientes inativos",
  q18: "Reativação de clientes", q19: "Origem dos clientes",
  q20: "Problema mais urgente", q21: "O que deveria ser mais fácil",
  q22: "O que faz perder dinheiro", q23: "Resultado ideal em 6 meses",
  q24: "Interesse em tecnologia",
};

const BLOCKS: Record<string, string[]> = {
  "Identificação": ["empresa", "nome", "produto", "tamanho", "tempo"],
  "Bloco 1 — Atendimento": ["q1", "q2", "q3", "q4", "q5", "q6"],
  "Bloco 2 — Processo de venda": ["q7", "q8", "q9", "q10"],
  "Bloco 3 — Ferramentas digitais": ["q11", "q12", "q13", "q14"],
  "Bloco 4 — Pós-venda": ["q15", "q16", "q17", "q18", "q19"],
  "Bloco 5 — Visão do responsável": ["q20", "q21", "q22", "q23", "q24"],
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const checkAdmin = async () => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsLogged(true);
        setResponses(data.responses);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  const exportCSV = () => {
    if (!responses.length) { alert("Nenhum dado para exportar."); return; }
    
    const headers = Object.keys(LABELS);
    const rows = responses.map(r => {
      return headers.map(k => {
        let val = "";
        if (["empresa", "nome", "produto", "tamanho", "tempo"].includes(k)) {
          val = r[k] || "";
        } else {
          val = r.answers?.[k] || "";
          if (Array.isArray(val)) val = val.join(" + ");
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    });
    
    const csv = [headers.map(k => LABELS[k]).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagnosticos.csv";
    a.click();
  };

  const todayStr = new Date().toLocaleDateString("pt-BR");
  const todayCount = responses.filter(r => new Date(r.submittedAt).toLocaleDateString("pt-BR") === todayStr).length;

  const weekCount = responses.filter(r => {
    const date = new Date(r.submittedAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 3600 * 24);
    return days <= 7;
  }).length;

  if (!isLogged) {
    return (
      <div className="page-wrap" style={{ justifyContent: "center" }}>
        <div className="form-container" style={{ maxWidth: "360px", marginBottom: "80px" }}>
          
          <div className="intro-logo" style={{ marginBottom: "24px" }}>
            <div className="intro-logo-dot" />
            <span className="intro-logo-text">ACESSO RESTRITO</span>
          </div>

          <h2 className="block-title" style={{ marginBottom: "28px" }}>Painel administrativo</h2>
          
          <div className="card">
            <div className="field-group">
              <label className="field-label">Senha</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAdmin()}
              />
            </div>
            <Button size="lg" onClick={checkAdmin} style={{ marginTop: "8px" }}>Entrar</Button>
            {error && <p style={{ color: "#f87171", fontSize: "13px", marginTop: "10px", fontFamily: "'DM Sans', sans-serif" }}>Senha incorreta.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div className="admin-header">
          <div>
            <div className="intro-logo" style={{ marginBottom: "8px" }}>
              <div className="intro-logo-dot" />
              <span className="intro-logo-text">ADMIN</span>
            </div>
            <h2 className="block-title" style={{ marginBottom: "0" }}>Diagnósticos recebidos</h2>
          </div>
          <Button variant="secondary" onClick={exportCSV}>Exportar CSV</Button>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{responses.length}</div>
            <div className="stat-label">Total de diagnósticos</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{todayCount}</div>
            <div className="stat-label">Recebidos hoje</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{weekCount}</div>
            <div className="stat-label">Esta semana</div>
          </div>
        </div>

        <div className="table-container">
          {responses.length === 0 ? (
            <div className="empty-state">
              <div style={{ color: "var(--text-hint)", fontSize: "24px", marginBottom: "8px" }}>—</div>
              <div className="empty-text">Nenhum diagnóstico recebido ainda.</div>
              <div className="empty-sub">As respostas aparecerão aqui assim que forem enviadas.</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Empresa</th>
                  <th>Responsável</th>
                  <th>Produto / Serviço</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r, i) => (
                  <tr key={r.id} onClick={() => setSelectedResponse(r)}>
                    <td style={{ color: "var(--text-muted)" }}>{responses.length - i}</td>
                    <td className="col-empresa">{r.company || "—"}</td>
                    <td className="col-resp">{r.name || "—"}</td>
                    <td className="col-resp" style={{ maxWidth: "200px" }}>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.product || "—"}
                      </div>
                    </td>
                    <td className="col-data">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td>
                      <span className="badge-ver">Ver</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedResponse && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setSelectedResponse(null)}>✕</button>
            
            <h2 className="modal-title">{selectedResponse.company || "Sem nome"}</h2>
            <p className="modal-sub">
              {selectedResponse.name || ""} — {selectedResponse.submittedAt ? new Date(selectedResponse.submittedAt).toLocaleString("pt-BR") : ""}
            </p>

            {Object.entries(BLOCKS).map(([blockName, keys]) => {
              const hasData = keys.some(k => 
                (selectedResponse[k] && typeof selectedResponse[k] === 'string') || 
                (selectedResponse.answers?.[k] !== undefined)
              );
              
              if (!hasData) return null;

              return (
                <div key={blockName}>
                  <p className="modal-block-title">{blockName}</p>
                  {keys.map(k => {
                    let val = "";
                    if (["empresa", "nome", "produto", "tamanho", "tempo"].includes(k)) {
                      val = selectedResponse[k];
                    } else {
                      val = selectedResponse.answers?.[k];
                      if (Array.isArray(val)) val = val.join(" + ");
                    }

                    if (!val) return null;

                    return (
                      <div key={k} style={{ marginBottom: "16px" }}>
                        <p className="modal-q-label">{LABELS[k]}</p>
                        <p className="modal-q-ans">{val}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
