export const SERVICOS = {

  /* =======================
     🔵 ZONA AZUL — RÁPIDO
  ======================= */

  extrato: {
    nome: "Extrato de pagamento de benefício",
    zona: "azul",
    tipo: "rapido",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF",
      "Comprovante de residência"
    ],
    docsExtras: [
      "Número do benefício"
    ]
  },

  cadastro: {
    nome: "Atualização de dados cadastrais",
    zona: "azul",
    tipo: "rapido",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF",
      "Comprovante de residência"
    ]
  },

  prova_vida: {
    nome: "Prova de vida",
    zona: "azul",
    tipo: "rapido",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF"
    ]
  },

  exigencia: {
    nome: "Cumprimento de exigência",
    zona: "azul",
    tipo: "rapido",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF"
    ],
    docsExtras: [
      "Documento solicitado na exigência"
    ]
  },

  suporte_gov: {
    nome: "Suporte acesso Gov",
    zona: "azul",
    tipo: "rapido",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF"
    ]
  },

  /* =======================
     🟢 ZONA VERDE — ANALÍTICO
  ======================= */

  aposentadoria: {
    nome: "Aposentadoria",
    zona: "verde",
    tipo: "analitico",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF",
      "Comprovante de residência",
      "Carteira de trabalho"
    ],
    docsExtras: [
      "Carnês GPS",
      "CNIS",
      "Certidão de tempo de contribuição",
      "PPP",
      "LTCAT"
    ]
  },

  auxilio: {
    nome: "Auxílio por incapacidade",
    zona: "verde",
    tipo: "analitico",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF"
    ],
    docsExtras: [
      "Atestado médico",
      "Laudos",
      "Exames",
      "Receitas"
    ]
  },

  bpc: {
    nome: "BPC LOAS",
    zona: "verde",
    tipo: "analitico",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF"
    ],
    docsExtras: [
      "CPF da família",
      "Comprovante de renda",
      "Cadastro Único",
      "Laudos médicos"
    ]
  },

  pensao: {
    nome: "Pensão por morte",
    zona: "verde",
    tipo: "analitico",
    docsBasicos: [
      "Documento oficial com foto",
      "CPF"
    ],
    docsExtras: [
      "Certidão de óbito",
      "Documento do falecido",
      "Certidão de casamento",
      "Comprovação de dependência"
    ]
  }

};