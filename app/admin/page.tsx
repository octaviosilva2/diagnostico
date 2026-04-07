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
  const [view, setView] = useState<"active" | "trash">("active");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setResponses(data.responses);
      }
    } catch (e) {}
  };

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

  const moveToTrash = async (id: number) => {
    try {
      const res = await fetch(`/api/responses/${id}/trash`, { method: "PATCH" });
      if (res.ok) {
        setOpenMenuId(null);
        await fetchData();
      }
    } catch (e) {}
  };

  const restoreFromTrash = async (id: number) => {
    try {
      const res = await fetch(`/api/responses/${id}/restore`, { method: "PATCH" });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {}
  };

  const permanentDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/responses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDeleteId(null);
        await fetchData();
      }
    } catch (e) {}
  };

  const exportCSV = () => {
    const activeOnes = responses.filter(r => !r.deletedAt);
    if (!activeOnes.length) { alert("Nenhum dado para exportar."); return; }
    
    const headers = Object.keys(LABELS);
    const rows = activeOnes.map(r => {
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

  const activeResponses = responses.filter(r => !r.deletedAt);
  const trashResponses = responses.filter(r => !!r.deletedAt);

  const todayStr = new Date().toLocaleDateString("pt-BR");
  const todayCount = activeResponses.filter(r => new Date(r.submittedAt).toLocaleDateString("pt-BR") === todayStr).length;

  const weekCount = activeResponses.filter(r => {
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
        
        {view === "active" ? (
          <>
            <div className="admin-header">
              <div>
                <div className="intro-logo" style={{ marginBottom: "8px" }}>
                  <div className="intro-logo-dot" />
                  <span className="intro-logo-text">ADMIN</span>
                </div>
                <h2 className="block-title" style={{ marginBottom: "0" }}>Diagnósticos recebidos</h2>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button variant="secondary" onClick={() => setView("trash")} style={{ position: "relative" }}>
                  <span style={{ marginRight: "6px" }}>🗑</span>
                  Lixeira
                  {trashResponses.length > 0 && (
                    <span style={{ 
                      marginLeft: "8px", background: "var(--accent)", color: "white", 
                      borderRadius: "10px", padding: "2px 8px", fontSize: "11px", fontWeight: "bold" 
                    }}>
                      {trashResponses.length}
                    </span>
                  )}
                </Button>
                <Button variant="secondary" onClick={exportCSV}>Exportar CSV</Button>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-num">{activeResponses.length}</div>
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
              {activeResponses.length === 0 ? (
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
                    {activeResponses.map((r, i) => (
                      <tr key={r.id} style={{ cursor: "default" }}>
                        <td style={{ color: "var(--text-muted)" }}>{activeResponses.length - i}</td>
                        <td className="col-empresa" onClick={() => setSelectedResponse(r)} style={{ cursor: "pointer" }}>{r.company || "—"}</td>
                        <td className="col-resp" onClick={() => setSelectedResponse(r)} style={{ cursor: "pointer" }}>{r.name || "—"}</td>
                        <td className="col-resp" style={{ maxWidth: "200px", cursor: "pointer" }} onClick={() => setSelectedResponse(r)}>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.product || "—"}
                          </div>
                        </td>
                        <td className="col-data" onClick={() => setSelectedResponse(r)} style={{ cursor: "pointer" }}>
                          {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td style={{ position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="badge-ver" onClick={() => setSelectedResponse(r)} style={{ cursor: "pointer" }}>Ver</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === r.id ? null : r.id);
                              }}
                              style={{ 
                                background: "none", border: "none", color: "var(--text-muted)", 
                                fontSize: "18px", cursor: "pointer", padding: "0 4px" 
                              }}
                            >
                              ⋯
                            </button>
                          </div>
                          
                          {openMenuId === r.id && (
                            <div className="dropdown-menu" style={{
                              position: "absolute", right: "0", top: "100%", zIndex: 50,
                              background: "var(--bg-card)", border: "1px solid var(--border)",
                              borderRadius: "8px", padding: "4px", minWidth: "160px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                            }}>
                              <div 
                                onClick={() => moveToTrash(r.id)}
                                style={{ 
                                  padding: "8px 14px", fontSize: "14px", cursor: "pointer", 
                                  borderRadius: "6px", color: "#f87171" 
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                              >
                                Mover para lixeira
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="admin-header">
              <div>
                <Button variant="secondary" onClick={() => setView("active")} style={{ marginBottom: "16px" }}>← Voltar</Button>
                <h2 className="block-title" style={{ marginBottom: "4px" }}>Lixeira</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Itens aqui podem ser recuperados ou deletados permanentemente</p>
              </div>
            </div>

            <div className="table-container" style={{ marginTop: "24px" }}>
              {trashResponses.length === 0 ? (
                <div className="empty-state">
                  <div style={{ color: "var(--text-hint)", fontSize: "24px", marginBottom: "8px" }}>🗑</div>
                  <div className="empty-text">Nenhum item na lixeira.</div>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Empresa</th>
                      <th>Responsável</th>
                      <th>Data</th>
                      <th style={{ textAlign: "right" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashResponses.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: "var(--text-muted)" }}>{trashResponses.length - i}</td>
                        <td>{r.company || "—"}</td>
                        <td>{r.name || "—"}</td>
                        <td>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("pt-BR") : "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button 
                              onClick={() => restoreFromTrash(r.id)}
                              style={{ 
                                background: "var(--accent-dim)", color: "var(--accent)", 
                                border: "none", borderRadius: "6px", padding: "6px 12px", 
                                fontSize: "13px", fontWeight: "500", cursor: "pointer" 
                              }}
                            >
                              Recuperar
                            </button>
                            <button 
                              onClick={() => setConfirmDeleteId(r.id)}
                              style={{ 
                                background: "rgba(239,68,68,0.1)", color: "#f87171", 
                                border: "none", borderRadius: "6px", padding: "6px 12px", 
                                fontSize: "13px", fontWeight: "500", cursor: "pointer" 
                              }}
                            >
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* CONFIRM PERMANENT DELETE MODAL */}
      {confirmDeleteId !== null && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "420px" }}>
            <h2 className="modal-title" style={{ fontSize: "22px", marginBottom: "12px" }}>Deletar permanentemente?</h2>
            <p className="modal-sub" style={{ marginBottom: "28px", lineHeight: "1.6" }}>
              Esta ação não pode ser desfeita. O diagnóstico de <strong>{responses.find(r => r.id === confirmDeleteId)?.company || "esta empresa"}</strong> será removido para sempre.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
              <button 
                onClick={() => permanentDelete(confirmDeleteId!)}
                style={{ 
                  background: "#ef4444", color: "white", border: "none", 
                  borderRadius: "8px", padding: "10px 24px", fontWeight: "500", cursor: "pointer" 
                }}
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedResponse && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setSelectedResponse(null)}>✕</button>
            
            <h2 className="modal-title">{selectedResponse.empresa || "Sem nome"}</h2>
            <p className="modal-sub">
              {selectedResponse.nome || ""} — {selectedResponse.submittedAt ? new Date(selectedResponse.submittedAt).toLocaleString("pt-BR") : ""}
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
