"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Input";
import { Radio, Checkbox } from "./ui/Selection";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = "diag_v2_next";

type FormData = {
  empresa: string;
  nome: string;
  produto: string;
  tamanho: string;
  tempo: string;
  answers: Record<string, string | string[]>;
  conditionals: Record<string, string>; // Store 'Outro...' text or specific conditional outputs
};

const initialData: FormData = {
  empresa: "",
  nome: "",
  produto: "",
  tamanho: "",
  tempo: "",
  answers: {},
  conditionals: {},
};

export function DiagnosticForm() {
  const [step, setStep] = useState(0); // 0: Intro, 1-5: Blocks, 6: Success
  const [data, setData] = useState<FormData>(initialData);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed.data || initialData);
        setStep(parsed.step !== undefined ? parsed.step : 0);
      } catch (e) {
        setStep(0);
      }
    }
  }, []);

  useEffect(() => {
    if (step >= 0 && step <= 5) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }));
      // Show toast
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [data, step]);

  const updateAnswer = (id: string, value: string | string[]) => {
    setData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [id]: value }
    }));
  };

  const updateConditional = (id: string, value: string) => {
    setData((prev) => ({
      ...prev,
      conditionals: { ...prev.conditionals, [id]: value }
    }));
  };

  const progressPct = step === 0 ? 0 : step === 6 ? 100 : Math.round(((step) / 5) * 100);

  const startForm = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextStep = (target: number) => {
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitForm = async () => {
    try {
      // Process answers to concatenate conditional texts
      const processedAnswers = { ...data.answers };
      
      const conditionalMappings: Record<string, { condId: string, triggers: string[] }> = {
        q1: { condId: "cond_q1", triggers: ["Outro"] },
        q2: { condId: "cond_q2", triggers: ["Outro"] },
        q6: { condId: "cond_q6", triggers: ["Sim, com certeza", "Provavelmente sim"] },
        q8: { condId: "cond_q8", triggers: ["Outro"] },
        q9: { condId: "cond_q9", triggers: ["Sim", "Às vezes"] },
        q11: { condId: "cond_q11", triggers: ["Outro"] },
        q13: { condId: "cond_q13", triggers: ["Outro"] },
        q14: { condId: "cond_q14", triggers: ["Sim e funcionou bem", "Sim mas não deu certo"] },
        q19: { condId: "cond_q19", triggers: ["Outro"] },
        q24: { condId: "cond_q24", triggers: ["Sim, já tentei"] }
      };

      Object.entries(conditionalMappings).forEach(([qId, config]) => {
        const answer = processedAnswers[qId];
        const condText = data.conditionals[config.condId];
        
        if (answer && condText && condText.trim() !== "") {
          if (Array.isArray(answer)) {
            processedAnswers[qId] = answer.map(opt => 
              config.triggers.includes(opt) ? `${opt} — ${condText.trim()}` : opt
            );
          } else {
            if (config.triggers.includes(answer as string)) {
              processedAnswers[qId] = `${answer} — ${condText.trim()}`;
            }
          }
        }
      });

      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          answers: processedAnswers,
          submittedAt: new Date().toISOString()
        }),
      });
      if (res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        setStep(6);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      alert("Erro ao enviar.");
    }
  };

  return (
    <div className="page-wrap">
      {/* Progress Bar mapped directly as a raw div using the global styles structure but mapped locally for convenience, or using an ID. I'll use inline styles over the ID for the next component. */}
      <div 
        id="progress-bar"
        style={{ 
          position: "fixed", top: 0, left: 0, height: "2px", zIndex: 200,
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          width: `${progressPct}%`, 
          background: "linear-gradient(90deg, #6d5bff, #a78bff)",
          boxShadow: "0 0 12px rgba(139,120,255,0.6)"
        }} 
      />

      <div id="save-toast" className={showToast ? "show" : ""} style={{
        position: "fixed", bottom: "28px", right: "24px",
        background: "#1a1a28", border: "1px solid var(--border)",
        borderRadius: "8px", padding: "10px 16px",
        fontSize: "12px", color: "var(--text-muted)",
        opacity: showToast ? 1 : 0, transition: "opacity 0.3s", zIndex: 300
      }}>
        Progresso salvo
      </div>

      <div className="form-container">
        {step === 0 && (
          <div className="screen active">
            <div className="intro-logo">
              <div className="intro-logo-dot" />
              <span className="intro-logo-text">Diagnóstico</span>
            </div>
            
            <h1 className="intro-title">Diagnóstico de <em>IA e Automação</em></h1>
            <p className="intro-sub">Responda no seu tempo. Não há respostas certas ou erradas — queremos entender como seu negócio funciona hoje.</p>

            <div className="card">
              <div className="field-group">
                <label className="field-label">Nome da empresa</label>
                <Input 
                  value={data.empresa}
                  onChange={(e) => setData({ ...data, empresa: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Seu nome e cargo</label>
                <Input 
                  value={data.nome}
                  onChange={(e) => setData({ ...data, nome: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label">O que sua empresa vende?</label>
                <Textarea 
                  placeholder="Seja específico." 
                  style={{ minHeight: "72px" }}
                  value={data.produto}
                  onChange={(e) => setData({ ...data, produto: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Tamanho da equipe</label>
                <div>
                  {["Só eu", "2 a 5", "6 a 15", "16 a 50", "Mais de 50"].map((opt) => (
                    <Radio 
                      key={opt} label={opt === "Só eu" ? "Só eu" : `${opt} pessoas`}
                      checked={data.tamanho === opt}
                      onChange={() => setData({ ...data, tamanho: opt })}
                    />
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Tempo de mercado</label>
                <div>
                  {["Menos de 1 ano", "1 a 3 anos", "3 a 10 anos", "Mais de 10 anos"].map((opt) => (
                    <Radio 
                      key={opt} label={opt}
                      checked={data.tempo === opt}
                      onChange={() => setData({ ...data, tempo: opt })}
                    />
                  ))}
                </div>
              </div>

              <Button size="lg" onClick={startForm}>Começar</Button>
            </div>
          </div>
        )}

        {/* BLOCKS LOGIC */}
        {step >= 1 && step <= 5 && (
          <div className="screen active" key={step}>
            <p className="block-label">Bloco {step} de 5</p>
            <h2 className="block-title">
              {step === 1 && "Atendimento e chegada de clientes"}
              {step === 2 && "Processo de venda e operação"}
              {step === 3 && "Ferramentas e controle digital"}
              {step === 4 && "Pós-venda e retenção"}
              {step === 5 && "Visão do responsável"}
            </h2>

            {step === 1 && (
              <>
                <Question id="q1" type="checkbox" title="Por onde os clientes costumam entrar em contato com vocês?" hint="Selecione no máximo 3 canais que mais utilizam" options={["WhatsApp", "Telefone", "Instagram", "Facebook", "Site", "E-mail", "Pessoalmente", "Indicação", "Outro"]} data={data} updateAns={updateAnswer} condTrigger={["Outro"]} condId="cond_q1" maxSelect={3}>
                  <Input placeholder="Qual canal?" value={data.conditionals["cond_q1"] || ""} onChange={(e) => updateConditional("cond_q1", e.target.value)} />
                </Question>

                <Question id="q2" type="radio" title="Quem responde esses contatos hoje?" options={["Eu mesmo", "Um funcionário específico", "Qualquer um da equipe", "Ninguém — fico devendo resposta", "Outro"]} data={data} updateAns={updateAnswer} condTrigger={["Outro"]} condId="cond_q2">
                  <Input placeholder="Descreva..." value={data.conditionals["cond_q2"] || ""} onChange={(e) => updateConditional("cond_q2", e.target.value)} />
                </Question>

                <Question id="q3" type="radio" title="Quanto tempo costuma levar para responder um cliente novo?" options={["Na hora", "Em algumas horas", "No mesmo dia", "No dia seguinte ou mais", "Depende — às vezes demoro muito"]} data={data} updateAns={updateAnswer} />
                
                <Question id="q4" type="radio" title="Como vocês lidam com clientes ou leads que chegam fora do horário comercial?" options={["Ficam sem resposta até o próximo dia", "Alguém vê pelo celular e responde", "Temos algum sistema automático", "Não recebemos contatos fora do horário"]} data={data} updateAns={updateAnswer} />

                <Question id="q5" type="radio" title="Vocês têm alguma métrica de conversão?" hint="Exemplo: de 10 pessoas que entram em contato, quantas viram cliente?" options={["1 a 2", "3 a 4", "5 a 6", "7 a 8", "Quase todas", "Não medimos isso"]} data={data} updateAns={updateAnswer} />

                <Question id="q6" type="radio" title="Já perdeu cliente por demora em responder ou falta de retorno?" options={["Sim, com certeza", "Provavelmente sim", "Não acredito que sim", "Nunca pensei nisso"]} data={data} updateAns={updateAnswer} condTrigger={["Sim, com certeza", "Provavelmente sim"]} condId="cond_q6">
                  <Textarea placeholder="O que aconteceu?" rows={2} value={data.conditionals["cond_q6"] || ""} onChange={(e) => updateConditional("cond_q6", e.target.value)} />
                </Question>
              </>
            )}

            {step === 2 && (
              <>
                <Question id="q7" type="textarea" title="Como funciona o caminho desde o primeiro contato até fechar a venda?" hint="Ex: Cliente manda mensagem → faço orçamento → marco visita → envio proposta → fechamos" placeholder="Escreva de forma completa. Quanto mais detalhar, melhor será o diagnóstico." data={data} updateAns={updateAnswer} />

                <Question id="q8" type="checkbox" title="Qual etapa desse processo toma mais tempo hoje?" options={["Responder perguntas repetidas", "Fazer orçamento", "Agendar visitas ou reuniões", "Enviar proposta", "Cobrar", "Follow-up de quem sumiu", "Outro"]} data={data} updateAns={updateAnswer} condTrigger={["Outro"]} condId="cond_q8">
                  <Input placeholder="Qual etapa?" value={data.conditionals["cond_q8"] || ""} onChange={(e) => updateConditional("cond_q8", e.target.value)} />
                </Question>

                <Question id="q9" type="radio" title="Tem alguma etapa que quando uma pessoa específica falta, trava tudo?" options={["Sim", "Às vezes", "Não"]} data={data} updateAns={updateAnswer} condTrigger={["Sim", "Às vezes"]} condId="cond_q9">
                  <Input placeholder="Qual etapa trava?" value={data.conditionals["cond_q9"] || ""} onChange={(e) => updateConditional("cond_q9", e.target.value)} />
                </Question>

                <Question id="q10" type="radio" title="Com que frequência perdem tempo com tarefas que parecem desnecessárias?" options={["Todo dia", "Algumas vezes por semana", "Raramente", "Nunca pensei nisso"]} data={data} updateAns={updateAnswer} />
              </>
            )}

            {step === 3 && (
              <>
                <Question id="q11" type="checkbox" title="Como vocês controlam os pedidos e clientes em andamento hoje?" options={["Planilha Excel / Google Sheets", "Sistema ou CRM", "Caderno ou post-it", "WhatsApp", "Memória", "Não temos controle", "Outro"]} data={data} updateAns={updateAnswer} condTrigger={["Outro"]} condId="cond_q11" rawOptions={["Planilha Excel/Google Sheets", "Sistema ou CRM", "Caderno ou post-it", "WhatsApp", "Memória", "Não temos controle", "Outro"]}>
                  <Input placeholder="Como vocês controlam?" value={data.conditionals["cond_q11"] || ""} onChange={(e) => updateConditional("cond_q11", e.target.value)} />
                </Question>

                <Question id="q12" type="radio" title="Vocês conseguem ver os números do negócio com facilidade?" hint="Faturamento do mês, pedidos abertos, clientes ativos" options={["Sim, temos painel ou relatório", "Sim, mas dá trabalho montar", "Só quando alguém para para calcular", "Não temos isso"]} data={data} updateAns={updateAnswer} />

                <Question id="q13" type="checkbox" title="Quais tarefas digitais a equipe repete todo dia?" options={["Copiar informação de um lugar para outro", "Mandar mensagens de confirmação", "Preencher planilha manualmente", "Gerar relatórios", "Emitir nota fiscal", "Atualizar cadastros", "Não sei identificar", "Outro"]} data={data} updateAns={updateAnswer} condTrigger={["Outro"]} condId="cond_q13">
                  <Input placeholder="Qual tarefa?" value={data.conditionals["cond_q13"] || ""} onChange={(e) => updateConditional("cond_q13", e.target.value)} />
                </Question>

                <Question id="q14" type="radio" title="Já tentaram usar algum sistema ou tecnologia para melhorar a operação?" options={["Sim e funcionou bem", "Sim mas não deu certo", "Não, nunca tentamos", "Estamos pensando em tentar"]} data={data} updateAns={updateAnswer} condTrigger={["Sim e funcionou bem", "Sim mas não deu certo"]} condId="cond_q14">
                  <Textarea placeholder="O que usaram e o que aconteceu?" rows={2} value={data.conditionals["cond_q14"] || ""} onChange={(e) => updateConditional("cond_q14", e.target.value)} />
                </Question>
              </>
            )}

            {step === 4 && (
              <>
                <Question id="q15" type="radio" title="Depois de entregar o produto ou serviço, entram em contato com o cliente?" options={["Sim, sempre", "Às vezes", "Raramente", "Nunca"]} data={data} updateAns={updateAnswer} />
                
                <Question id="q16" type="radio" title="Vocês pedem avaliação no Google ou feedback depois da entrega?" options={["Sim, temos um processo para isso", "Pedimos mas sem processo definido", "Raramente", "Nunca pedimos"]} data={data} updateAns={updateAnswer} />

                <Question id="q17" type="radio" title="Sabem quais clientes não compram há muito tempo?" options={["Sim, acompanhamos", "Mais ou menos", "Não temos como saber", "Nunca pensamos nisso"]} data={data} updateAns={updateAnswer} />

                <Question id="q18" type="radio" title="Fazem alguma ação para reativar clientes antigos?" options={["Sim, regularmente", "Às vezes", "Nunca fizemos isso"]} data={data} updateAns={updateAnswer} />

                <Question id="q19" type="checkbox" title="A maioria dos clientes novos vem de onde?" hint="Selecione no máximo 3 origens que mais trazem clientes" options={["Indicação de clientes", "Google", "Instagram", "Facebook", "Prospecção ativa", "Boca a boca", "Anúncios pagos", "Outro"]} data={data} updateAns={updateAnswer} condTrigger={["Outro"]} condId="cond_q19" maxSelect={3}>
                  <Input placeholder="Qual canal?" value={data.conditionals["cond_q19"] || ""} onChange={(e) => updateConditional("cond_q19", e.target.value)} />
                </Question>
              </>
            )}

            {step === 5 && (
              <>
                <Question id="q20" type="textarea" title="Se você pudesse resolver um problema da operação agora, qual seria?" hint="Escreva de forma completa. Isso é o coração do diagnóstico." placeholder="Descreva o problema mais urgente..." data={data} updateAns={updateAnswer} />

                <Question id="q21" type="textarea" title="Tem alguma coisa no dia a dia que você sente que deveria ser mais rápida ou mais fácil?" hint="Detalhe ao máximo. Exemplos concretos ajudam muito." placeholder="Ex: responder clientes, gerar relatórios, cobrar..." data={data} updateAns={updateAnswer} />

                <Question id="q22" type="textarea" title="O que você acha que está fazendo sua empresa perder dinheiro ou clientes hoje?" hint="Seja direto e completo. Não há resposta errada." placeholder="Seja direto, não há resposta errada..." data={data} updateAns={updateAnswer} />

                <Question id="q23" type="textarea" title="Qual seria o resultado ideal para você daqui a 6 meses?" hint="Quanto mais específico, mais útil será o diagnóstico." placeholder="Descreva o cenário ideal..." data={data} updateAns={updateAnswer} />

                <Question id="q24" type="radio" title="Já pensou em usar tecnologia ou automação para resolver alguma dessas coisas?" hint="Se já tentou algo, descreva o que foi e o que aconteceu." options={["Sim, já tentei", "Tenho interesse mas não sei como", "Nunca pensei nisso", "Prefiro não"]} data={data} updateAns={updateAnswer} condTrigger={["Sim, já tentei", "Tenho interesse mas não sei como", "Nunca pensei nisso", "Prefiro não"]} condId="cond_q24">
                  <Textarea placeholder="O que você tentou?" rows={2} value={data.conditionals["cond_q24"] || ""} onChange={(e) => updateConditional("cond_q24", e.target.value)} />
                </Question>
              </>
            )}

            <div className="nav-row">
              {step > 1 ? (
                <Button variant="secondary" onClick={() => nextStep(step - 1)}>← Voltar</Button>
              ) : <span />}
              {step < 5 ? (
                <Button onClick={() => nextStep(step + 1)}>Avançar →</Button>
              ) : (
                <Button onClick={submitForm}>Enviar diagnóstico</Button>
              )}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {step === 6 && (
          <div className="screen active" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px 20px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              border: "2px solid var(--accent)", background: "var(--accent-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "30px", marginBottom: "28px",
              boxShadow: "0 0 32px rgba(139,120,255,0.2)"
            }}>✓</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", marginBottom: "12px" }}>Diagnóstico enviado!</h2>
            <p style={{ fontSize: "16px", color: "var(--text-muted)", maxWidth: "420px", lineHeight: 1.6 }}>
              Obrigado. Em breve entrarei em contato com as oportunidades que identifiquei para o seu negócio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
type QuestionProps = {
  id: string;
  type: "radio" | "checkbox" | "textarea";
  title: string;
  hint?: string;
  placeholder?: string;
  options?: string[];
  rawOptions?: string[]; // Used when label != value in original HTML
  condTrigger?: string[];
  condId?: string;
  maxSelect?: number;
  children?: React.ReactNode;
  data: FormData;
  updateAns: (id: string, val: any) => void;
};

function Question({ id, type, title, hint, placeholder, options, rawOptions, condTrigger, condId, maxSelect, children, data, updateAns }: QuestionProps) {
  const currentVal = data.answers[id];
  const actualOptions = rawOptions || options || [];

  const toggleCheck = (val: string) => {
    let list = (currentVal || []) as string[];
    if (list.includes(val)) list = list.filter(v => v !== val);
    else list = [...list, val];
    updateAns(id, list);
  };

  const isCondOpen = () => {
    if (!condTrigger || !currentVal) return false;
    if (Array.isArray(currentVal)) {
      return currentVal.some(v => condTrigger.includes(v));
    }
    return condTrigger.includes(currentVal);
  };

  return (
    <div className="card question">
      <p className="q-text">{title}</p>
      {hint && <p className="q-hint">{hint}</p>}
      {!hint && <div style={{ marginBottom: "16px" }} />}

      {type === "radio" && options && (
        <div className="options-group">
          {options.map((opt, idx) => (
            <Radio 
              key={opt} label={opt} 
              checked={currentVal === actualOptions[idx]}
              onChange={() => updateAns(id, actualOptions[idx])}
            />
          ))}
        </div>
      )}

      {type === "checkbox" && options && (
        <div className="options-group">
          {options.map((opt, idx) => {
            const isChecked = Array.isArray(currentVal) && currentVal.includes(actualOptions[idx]);
            const isLimitReached = !isChecked && maxSelect !== undefined && Array.isArray(currentVal) && currentVal.length >= maxSelect;
            
            return (
              <Checkbox 
                key={opt} label={opt} 
                checked={isChecked}
                onChange={() => toggleCheck(actualOptions[idx])}
                disabled={isLimitReached}
              />
            );
          })}
        </div>
      )}

      {type === "textarea" && (
        <Textarea 
          placeholder={placeholder}
          value={currentVal as string || ""}
          onChange={(e) => updateAns(id, e.target.value)}
        />
      )}

      {condTrigger && children && (
        <div 
          className={cn(
            "conditional",
            isCondOpen() ? "open" : ""
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
