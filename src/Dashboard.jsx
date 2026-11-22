import { useState } from "react";

// Dashboard de eventos da Hika.fe (separado do dashboard das lojas em 21/11/2026)
const COR_ALEM = "#34d399";  // verde — meta batida ou superada
const fmtDataBR = iso => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
const cardStyle  = { background: "#141928", border: "1px solid #252d42", borderRadius: 10, padding: "14px 18px", minWidth: 200, flex: 1 };
const cardLabel  = { fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 };
const cardValue  = { fontSize: 22, fontWeight: 800, color: "#e2e8f0" };
const cardSub    = { fontSize: 12, color: "#94a3b8", marginTop: 4 };
const r2 = v => Math.round(v * 100 + 1e-6) / 100; // +1e-6 corrige meio-centavo em ponto flutuante (ex: 167,50 × 3% = 5,025 → 5,03)
const fmtMoeda2 = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COR_PENDENTE = "#fbbf24";
const reservaTh = { padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#94a3b8", background: "#0d1117", textAlign: "right", borderBottom: "1px solid #252d42", whiteSpace: "nowrap" };
const reservaThL = { ...reservaTh, textAlign: "left" };
const reservaTd = { padding: "9px 12px", fontSize: 13, textAlign: "right", borderBottom: "1px solid #1e2740", whiteSpace: "nowrap" };
const reservaTdL = { ...reservaTd, textAlign: "left" };
const reservaSecao = { fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4, paddingTop: 16, borderTop: "1px solid #252d42" };
const reservaNota = { fontSize: 12, color: "#475569", marginBottom: 12 };
const corRes = v => v >= 0 ? COR_ALEM : "#f87171";   // resultado negativo sempre em vermelho
const painel = { background: "linear-gradient(135deg,#141928 0%,#1c2236 100%)", border: "1px solid #252d42", borderRadius: 14, padding: "20px 24px 24px" };
const tabBtn = ativo => ({ padding: "8px 16px", borderRadius: 8, border: "1px solid " + (ativo ? "#3b82f6" : "#252d42"), background: ativo ? "#1e3a8a" : "#141928", color: ativo ? "#e2e8f0" : "#94a3b8", fontSize: 13, fontWeight: 700, cursor: "pointer" });

const EVENTOS = [
  { data: "2026-10-30", loja: "MC", valor: 2430.00, cupom: 6119, nf: 11, descricao: "Evento MDP (coffee break): 540 cafés coados servidos, contrato de R$ 4.860,00 (R$ 9,00 por café) em 2 parcelas de R$ 2.430,00 (NF 11 = 1ª parcela, cupom de 270 coados com R$ 405 de desconto) · por café: insumos (café, filtro e copo) R$ 1,38, custo total R$ 3,92, resultado R$ 4,63",
    tipo: "MDP", formaPagamento: "Pix", taxaFinanceiraPct: 0,
    // `valor` = o que já virou NF (entra na linha "com evento" do Faturamento Acumulado no mês da NF)
    valorContrato: 4860.00,
    parcelas: [
      { n: 1, valor: 2430.00, nf: 11, emitidaEm: "2026-10-30", previsao: "semana de 02/11", pagoEm: "2026-11-03" },
      { n: 2, valor: 2430.00, nf: 12, emitidaEm: "2026-11-11", previsao: "13/11", previsaoData: "2026-11-13", pagoEm: "2026-11-18" },
    ],
    custos: [
      { item: "Copos", valor: 170.40 },
      { item: "Café em grãos: 2 pacotes x R$ 99,00", valor: 198.00 },
      { item: "Café em grãos: 3 pacotes x R$ 115,00 (5 kg de café no total)", valor: 345.00 },
      { item: "Filtros de café", valor: 33.75 },
      { item: "Garrafa térmica", valor: 119.90, equipamento: true },
      { item: "Chaleira elétrica", valor: 387.99, equipamento: true },
      { item: "Profissionais (2x R$ 400,00)", valor: 800.00 },
      { item: "Água mineral: 3 fardos × R$ 20,00 (6 garrafas de 1,5 L cada, 27 L)", valor: 60.00 },
    ],
    custosFechados: true },   // 03/11: com a água mineral, custos do evento fechados
  { data: "2026-11-07", loja: null, valor: 1180.00, cupom: null, nf: null, tipo: "Pioneiro",
    descricao: "Evento Pioneiro (07/11/2026): vendas na maquininha Stone pelo catálogo, fora do Saipos (relatório Stone de 07/11, até 12:06)",
    vendas: 47, itens: 64,
    formas: [["Crédito", 680.00], ["Débito", 328.00], ["Pix", 124.00], ["Dinheiro", 48.00]],
    taxas: { "Crédito": 0.0319, "Débito": 0.0075, "Pix": 0.005, "Dinheiro": 0 },   // Stone FP: crédito à vista Visa/Master 3,19%, débito Visa/Master 0,75%, Pix 0,5%
    repassePct: 0.20,      // 20% do faturamento bruto vai para o evento (informado em 07/11)
    simplesPct: 0,         // este evento não tem Simples (informado em 07/11)
    produtos: [["Espresso", 15, 135.00], ["Ichigo matcha latte", 15, 375.00], ["Matcha latte gelado", 9, 207.00], ["Latte caramelo gelado", 6, 138.00],
      ["Carioca", 5, 45.00], ["Blueberry matcha latte", 4, 100.00], ["Matcha latte quente", 3, 69.00], ["Latte gelado", 3, 63.00],
      ["Americano", 2, 20.00], ["Latte caramelo quente", 1, 23.00], ["Leite de aveia", 1, 5.00]],
    custos: [
      { item: "Profissional (1 pessoa)", valor: 250.00 },
      { item: "Água mineral: 1 fardo (6 garrafas de 1,5 L, 9 L)", valor: 20.00 },
      { item: "Ichigo matcha latte: 15 × R$ 9,00, custo completo com copo", valor: 135.00 },
      { item: "Matcha latte gelado: 9 × R$ 9,00 (custo do blueberry), custo completo com copo", valor: 81.00 },
      { item: "Latte caramelo gelado: 6 × R$ 9,00 (custo do blueberry), custo completo com copo", valor: 54.00 },
      { item: "Espresso: 15 × R$ 3,50 (custo do macchiato), custo completo com copo", valor: 52.50 },
      { item: "Blueberry matcha latte: 4 × R$ 9,00, custo completo com copo", valor: 36.00 },
      { item: "Latte gelado: 3 × R$ 9,00 (custo do blueberry), custo completo com copo", valor: 27.00 },
      { item: "Matcha latte quente: 3 × R$ 6,00, custo completo com copo", valor: 18.00 },
      { item: "Carioca: 5 × R$ 3,50 (custo do macchiato), custo completo com copo", valor: 17.50 },
      { item: "Latte caramelo quente: 1 × R$ 9,00 (custo do blueberry), custo completo com copo", valor: 9.00 },
      { item: "Americano: 2 × R$ 3,50 (custo do macchiato), custo completo com copo", valor: 7.00 },
      { item: "Leite de aveia (adicional): 1 × R$ 2,00, custo completo com copo", valor: 2.00 },
    ],   // 20/11: custos por bebida informados (completos, incluem copo e café); substituem as estimativas de copos e café em grãos
    custosFechados: true },
  { data: "2026-11-19", tipo: "WS-LB", valor: 358.50, loja: "FP",
    descricao: "Workshop WS-LB (19/11/2026): 7 inscrições de R$ 50 com crédito de consumo; R$ 66 de créditos não usados ficam como lucro (já dentro das inscrições, sem custo lançado)",
    receitas: [["Inscrições (7 × R$ 50)", 350.00], ["Consumo acima do crédito", 8.50]],
    repasse: 140.00,          // repasse ao palestrante
    cmv: 188.62,              // custo dos produtos consumidos
    freelancer: 140.00,       // mostrado lado a lado: com e sem freelancer
    creditosNaoUsados: 66.00,
  },
];
const EVENTO_SIMPLES = 0.05;   // mesmo critério conservador dos onigiris (efetiva sem ST em set/26 foi 4,81%)

// Resultado de um evento (mesma conta das abas de evento): bruto − Simples − taxas − repasse − custos
const resultadoEvento = (e, semFreelancer = false) => {
  if (e.tipo === "WS-LB") return e.valor - e.repasse - e.cmv - (semFreelancer ? 0 : e.freelancer);
  const bruto = e.valorContrato || e.valor;
  const simples = bruto * (e.simplesPct != null ? e.simplesPct : EVENTO_SIMPLES);
  const taxa = e.taxas ? (e.formas || []).reduce((s, f) => s + f[1] * ((e.taxas || {})[f[0]] || 0), 0) : bruto * (e.taxaFinanceiraPct || 0);
  const repasse = bruto * (e.repassePct || 0);
  const custos = (e.custos || []).reduce((s, c) => s + c.valor, 0);
  return bruto - simples - taxa - repasse - custos;
};

export default function DashboardEventos() {
  const [tab, setTab] = useState("geral");
  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e2e8f0", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "24px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Eventos Hika.fe</div>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Resultado de cada evento, fora do dia a dia das lojas · atualizado até 22/11/2026</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button style={tabBtn(tab === "geral")} onClick={() => setTab("geral")}>Visão geral</button>
        <button style={tabBtn(tab === "evento")} onClick={() => setTab("evento")}>Evento MDP</button>
        <button style={tabBtn(tab === "pioneiro")} onClick={() => setTab("pioneiro")}>Evento Pioneiro</button>
        <button style={tabBtn(tab === "wslb")} onClick={() => setTab("wslb")}>Workshop WS-LB</button>
      </div>
      {tab === "geral" && (() => {
        const totSem = r2(EVENTOS.reduce((s, e) => s + resultadoEvento(e, true), 0)), totCom = r2(EVENTOS.reduce((s, e) => s + resultadoEvento(e), 0));
        return (
      <div style={painel}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>Visão geral dos eventos</div>
        <div style={reservaNota}>Resultado = faturamento − Simples − taxas − repasse − custos (mesma conta de cada aba) · WS-LB com e sem freelancer</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={cardStyle}><div style={cardLabel}>Eventos</div><div style={cardValue}>{EVENTOS.length}</div></div>
          <div style={cardStyle}><div style={cardLabel}>Faturamento total</div><div style={cardValue}>{fmtMoeda2(r2(EVENTOS.reduce((s, e) => s + (e.valorContrato || e.valor), 0)))}</div></div>
          <div style={cardStyle}><div style={cardLabel}>Resultado total</div><div style={{ ...cardValue, color: corRes(totSem) }}>{fmtMoeda2(totSem)}</div><div style={cardSub}>com freelancer no WS-LB: <span style={{ color: corRes(totCom) }}>{fmtMoeda2(totCom)}</span></div></div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
            <thead><tr><th style={reservaThL}>Data</th><th style={reservaThL}>Evento</th><th style={reservaTh}>Faturamento</th><th style={reservaTh}>Resultado</th><th style={reservaTh}>% do faturamento</th></tr></thead>
            <tbody>
              {EVENTOS.map(e => {
                const bruto = e.valorContrato || e.valor;
                const res = r2(resultadoEvento(e, true)), resCom = r2(resultadoEvento(e));
                const pct = v => (v / bruto * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
                return (
                  <tr key={e.tipo + e.data}>
                    <td style={reservaTdL}>{fmtDataBR(e.data)}</td>
                    <td style={{ ...reservaTdL, fontWeight: 700 }}>{e.tipo}</td>
                    <td style={reservaTd}>{fmtMoeda2(bruto)}</td>
                    <td style={{ ...reservaTd, fontWeight: 700 }}>{e.tipo === "WS-LB"
                      ? <><span style={{ color: corRes(res) }}>{fmtMoeda2(res)}</span> / <span style={{ color: corRes(resCom) }}>{fmtMoeda2(resCom)}</span></>
                      : <span style={{ color: corRes(res) }}>{fmtMoeda2(res)}</span>}</td>
                    <td style={reservaTd}>{e.tipo === "WS-LB"
                      ? <><span style={{ color: corRes(res) }}>{pct(res)}</span> / <span style={{ color: corRes(resCom) }}>{pct(resCom)}</span></>
                      : <span style={{ color: corRes(res) }}>{pct(res)}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ ...reservaNota, marginTop: 8 }}>WS-LB: sem freelancer / com freelancer</div>
      </div>
        );
      })()}
      {tab === "pioneiro" && (() => {
        const evs = EVENTOS.filter(e => e.tipo === "Pioneiro");
        return (
      <div style={{ background: "linear-gradient(135deg,#141928 0%,#1c2236 100%)", border: "1px solid #252d42", borderRadius: 14, padding: "20px 24px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>Evento Pioneiro</div>
        <div style={reservaNota}>Vendas feitas na maquininha Stone durante o evento, fora do Saipos · ficam fora das metas, ticket médio, produtos e horários do dashboard (só aparecem aqui e na linha "com evento" do Faturamento Acumulado)</div>
        {evs.map(e => {
          const bruto = e.valor;
          const simplesPct = e.simplesPct != null ? e.simplesPct : EVENTO_SIMPLES;
          const simples = r2(bruto * simplesPct);
          const taxasF = (e.formas || []).map(f => ({ forma: f[0], valor: f[1], pct: (e.taxas || {})[f[0]], taxa: (e.taxas || {})[f[0]] == null ? null : r2(f[1] * e.taxas[f[0]]) }));
          const taxa = r2(taxasF.reduce((s, x) => s + (x.taxa || 0), 0));
          const repasse = e.repassePct == null ? null : r2(bruto * e.repassePct);
          const custos = r2((e.custos || []).reduce((s, c) => s + c.valor, 0));
          const resultado = r2(bruto - simples - taxa - (repasse || 0) - custos);
          const fmtPct = p => (p * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
          const pct = v => (v / bruto * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
          const linha = (rot, v, o = {}) => (
            <tr key={rot} style={o.sep ? { borderTop: "2px solid #252d42" } : undefined}>
              <td style={{ ...reservaTdL, fontWeight: o.forte ? 800 : 400, color: o.cor, paddingLeft: o.sub ? 32 : 12 }}>{rot}</td>
              <td style={{ ...reservaTd, fontWeight: o.forte ? 800 : 400, color: o.cor }}>{v == null ? "a informar" : fmtMoeda2(v)}</td>
              <td style={{ ...reservaTd, color: "#94a3b8" }}>{v == null ? "" : pct(Math.abs(v))}</td>
            </tr>
          );
          return (
            <div key={e.data} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div style={cardStyle}><div style={cardLabel}>Faturamento · {fmtDataBR(e.data)}</div><div style={cardValue}>{fmtMoeda2(bruto)}</div><div style={cardSub}>{e.vendas} vendas · {e.itens} produtos</div></div>
                <div style={cardStyle}><div style={cardLabel}>Ticket médio</div><div style={cardValue}>{fmtMoeda2(r2(bruto / e.vendas))}</div><div style={cardSub}>{(e.itens / e.vendas).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} produtos por venda</div></div>
                <div style={cardStyle}><div style={cardLabel}>Resultado{e.custosFechados ? "" : " parcial"}</div><div style={{ ...cardValue, color: resultado >= 0 ? COR_ALEM : "#f87171" }}>{fmtMoeda2(resultado)}</div><div style={cardSub}>{pct(resultado)} do faturamento{e.custosFechados ? "" : " · demais custos ainda a informar"}</div></div>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{e.descricao}</div>
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420 }}>
                  <thead><tr><th style={reservaThL}>DRE do evento</th><th style={reservaTh}>Valor</th><th style={reservaTh}>% faturamento</th></tr></thead>
                  <tbody>
                    {linha("Faturamento bruto", bruto, { forte: true })}
                    {simplesPct > 0 && linha(`(−) Simples (${(simplesPct * 100).toFixed(0)}%)`, -simples)}
                    {linha(`(−) Repasse ao evento${e.repassePct == null ? " (% do faturamento)" : ` (${fmtPct(e.repassePct)} do faturamento)`}`, repasse == null ? null : -repasse)}
                    {linha("(−) Taxas da maquininha Stone", -taxa)}
                    {taxasF.map(x => linha(`${x.forma}${x.pct == null ? "" : ` (${fmtPct(x.pct)} sobre ${fmtMoeda2(x.valor)})`}`, x.taxa == null ? null : -x.taxa, { sub: true, cor: "#94a3b8" }))}
                    {linha(`(−) Custos do evento${e.custosFechados ? " (fechados)" : " (parciais)"}`, -custos)}
                    {(e.custos || []).map(c => linha(c.item, -c.valor, { sub: true, cor: "#94a3b8" }))}
                    {linha(`(=) Resultado${e.custosFechados ? "" : " parcial"}`, resultado, { forte: true, sep: true, cor: resultado >= 0 ? COR_ALEM : "#f87171" })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ overflowX: "auto", flex: "1 1 260px" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead><tr><th style={reservaThL}>Forma de pagamento</th><th style={reservaTh}>Valor</th><th style={reservaTh}>%</th></tr></thead>
                    <tbody>{(e.formas || []).map(f => (<tr key={f[0]}><td style={reservaTdL}>{f[0]}</td><td style={reservaTd}>{fmtMoeda2(f[1])}</td><td style={{ ...reservaTd, color: "#94a3b8" }}>{pct(f[1])}</td></tr>))}</tbody>
                  </table>
                </div>
                <div style={{ overflowX: "auto", flex: "2 1 360px" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead><tr><th style={reservaThL}>Produto</th><th style={reservaTh}>Qtd</th><th style={reservaTh}>Valor</th><th style={reservaTh}>%</th></tr></thead>
                    <tbody>{(e.produtos || []).map(p => (<tr key={p[0]}><td style={reservaTdL}>{p[0]}</td><td style={reservaTd}>{p[1]}</td><td style={reservaTd}>{fmtMoeda2(p[2])}</td><td style={{ ...reservaTd, color: "#94a3b8" }}>{pct(p[2])}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        );
      })()}
      {tab === "evento" && (() => {
        const evs = EVENTOS.filter(e => e.tipo === "MDP");
        return (
      <div style={{ background: "linear-gradient(135deg,#141928 0%,#1c2236 100%)", border: "1px solid #252d42", borderRadius: 14, padding: "20px 24px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>Evento MDP</div>
        <div style={reservaNota}>Vendas de eventos ficam fora das metas, ticket médio, produtos e horários do dashboard (só aparecem aqui e na linha "com evento" do Faturamento Acumulado) · DRE pelo contrato inteiro, com as duas parcelas</div>
        {evs.map(e => {
          const bruto = e.valorContrato || e.valor;
          const simples = r2(bruto * EVENTO_SIMPLES);
          const taxa = r2(bruto * (e.taxaFinanceiraPct || 0));
          const custos = r2((e.custos || []).reduce((s, c) => s + c.valor, 0));
          const equip = r2((e.custos || []).filter(c => c.equipamento).reduce((s, c) => s + c.valor, 0));
          const resultado = r2(bruto - simples - taxa - custos);
          const parcelas = e.parcelas || [{ n: 1, valor: e.valor, nf: e.nf, emitidaEm: e.data, pagoEm: e.pagoEm }];
          const recebido = r2(parcelas.filter(x => x.pagoEm).reduce((s, x) => s + x.valor, 0));
          const pct = v => (v / bruto * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
          const linha = (rot, v, o = {}) => (
            <tr key={rot} style={o.sep ? { borderTop: "2px solid #252d42" } : undefined}>
              <td style={{ ...reservaTdL, fontWeight: o.forte ? 800 : 400, color: o.cor, paddingLeft: o.sub ? 32 : 12 }}>{rot}</td>
              <td style={{ ...reservaTd, fontWeight: o.forte ? 800 : 400, color: o.cor }}>{v == null ? "a informar" : fmtMoeda2(v)}</td>
              <td style={{ ...reservaTd, color: "#94a3b8" }}>{v == null ? "" : pct(Math.abs(v))}</td>
            </tr>
          );
          return (
            <div key={e.cupom} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div style={cardStyle}><div style={cardLabel}>Contrato</div><div style={cardValue}>{fmtMoeda2(bruto)}</div><div style={cardSub}>{parcelas.length} parcelas · {parcelas.filter(x => x.nf).length} NF emitida{parcelas.filter(x => x.nf).length === 1 ? "" : "s"}</div></div>
                <div style={cardStyle}><div style={cardLabel}>Recebido</div><div style={{ ...cardValue, color: recebido >= bruto ? COR_ALEM : COR_PENDENTE }}>{fmtMoeda2(recebido)}</div><div style={cardSub}>{recebido >= bruto ? "contrato quitado" : `falta ${fmtMoeda2(r2(bruto - recebido))}`} · {e.formaPagamento}, sem custo financeiro</div></div>
                <div style={cardStyle}><div style={cardLabel}>Resultado</div><div style={{ ...cardValue, color: resultado >= 0 ? COR_ALEM : "#f87171" }}>{fmtMoeda2(resultado)}</div><div style={cardSub}>{pct(resultado)} do contrato · {fmtMoeda2(equip)} são equipamentos que ficam com a casa</div></div>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{e.descricao}</div>
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420 }}>
                  <thead><tr><th style={reservaThL}>DRE do evento</th><th style={reservaTh}>Valor</th><th style={reservaTh}>% contrato</th></tr></thead>
                  <tbody>
                    {linha("Faturamento bruto (contrato)", bruto, { forte: true })}
                    {linha(`(−) Simples (${(EVENTO_SIMPLES * 100).toFixed(0)}%)`, -simples)}
                    {linha(`(−) Custo financeiro (${e.formaPagamento}, ${(e.taxaFinanceiraPct * 100).toFixed(0)}%)`, -taxa)}
                    {linha(`(−) Custos do evento${e.custosFechados ? " (fechados)" : " (parciais)"}`, -custos)}
                    {(e.custos || []).map(c => linha(`${c.item}${c.equipamento ? " (equipamento)" : ""}`, -c.valor, { sub: true, cor: "#94a3b8" }))}
                    {linha("(=) Resultado", resultado, { forte: true, sep: true, cor: resultado >= 0 ? COR_ALEM : "#f87171" })}
                    {equip > 0 && linha("Resultado sem os equipamentos (que ficam para outros eventos)", r2(resultado + equip), { cor: "#94a3b8" })}
                  </tbody>
                </table>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420 }}>
                  <thead><tr><th style={reservaThL}>Parcela</th><th style={reservaTh}>Valor</th><th style={reservaTh}>NF</th><th style={reservaTh}>Previsão</th><th style={reservaTh}>Recebimento</th></tr></thead>
                  <tbody>
                    {parcelas.map(x => (
                      <tr key={x.n}>
                        <td style={reservaTdL}>{x.n}ª parcela</td>
                        <td style={reservaTd}>{fmtMoeda2(x.valor)}</td>
                        <td style={{ ...reservaTd, color: x.nf ? "#e2e8f0" : "#475569" }}>{x.nf ? `nº ${x.nf} (${fmtDataBR(x.emitidaEm)})` : "a emitir"}</td>
                        <td style={reservaTd}>{x.previsao || "-"}</td>
                        <td style={{ ...reservaTd, fontWeight: 700, color: x.pagoEm ? COR_ALEM : COR_PENDENTE }}>{x.pagoEm ? `recebida ${fmtDataBR(x.pagoEm)}` : "pendente"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
        );
      })()}
      {tab === "wslb" && (() => {
        const evs = EVENTOS.filter(e => e.tipo === "WS-LB");
        return (
      <div style={painel}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>Workshop WS-LB</div>
        <div style={reservaNota}>DRE do workshop com e sem freelancer, lado a lado · se alguém voltar para usar o crédito, entra só o custo do que consumir</div>
        {evs.map(e => {
          const liquida = r2(e.valor - e.repasse);
          const margem = r2(liquida - e.cmv);
          const com = r2(margem - e.freelancer), sem = margem;
          const cor = v => v >= 0 ? COR_ALEM : "#f87171";
          const ln = (rot, a, b, o = {}) => (
            <tr key={rot} style={o.sep ? { borderTop: "2px solid #252d42" } : undefined}>
              <td style={{ ...reservaTdL, fontWeight: o.forte ? 800 : 400, color: o.sub ? "#94a3b8" : undefined, paddingLeft: o.sub ? 32 : 12 }}>{rot}</td>
              <td style={{ ...reservaTd, fontWeight: o.forte ? 800 : 400, color: o.corA || (o.sub ? "#94a3b8" : undefined) }}>{fmtMoeda2(a)}</td>
              <td style={{ ...reservaTd, fontWeight: o.forte ? 800 : 400, color: o.corB || (o.sub ? "#94a3b8" : undefined) }}>{fmtMoeda2(b)}</td>
            </tr>
          );
          return (
            <div key={e.data} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div style={cardStyle}><div style={cardLabel}>Receita bruta · {fmtDataBR(e.data)}</div><div style={cardValue}>{fmtMoeda2(e.valor)}</div><div style={cardSub}>inclui {fmtMoeda2(e.creditosNaoUsados)} de créditos não usados</div></div>
                <div style={cardStyle}><div style={cardLabel}>Resultado com freelancer</div><div style={{ ...cardValue, color: cor(com) }}>{fmtMoeda2(com)}</div></div>
                <div style={cardStyle}><div style={cardLabel}>Resultado sem freelancer</div><div style={{ ...cardValue, color: cor(sem) }}>{fmtMoeda2(sem)}</div></div>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{e.descricao}</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480 }}>
                  <thead><tr><th style={reservaThL}>DRE do workshop</th><th style={reservaTh}>Com freelancer</th><th style={reservaTh}>Sem freelancer</th></tr></thead>
                  <tbody>
                    {ln("Receita bruta", e.valor, e.valor, { forte: true })}
                    {e.receitas.map(x => ln(x[0], x[1], x[1], { sub: true }))}
                    {ln("(−) Repasse ao palestrante", -e.repasse, -e.repasse)}
                    {ln("(=) Receita líquida", liquida, liquida, { forte: true })}
                    {ln("(−) Custo dos produtos vendidos", -e.cmv, -e.cmv)}
                    {ln("(=) Margem bruta", margem, margem, { forte: true })}
                    {ln("(−) Freelancer", -e.freelancer, 0)}
                    {ln("(=) Resultado", com, sem, { forte: true, sep: true, corA: cor(com), corB: cor(sem) })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
        );
      })()}
      </div>
    </div>
  );
}
