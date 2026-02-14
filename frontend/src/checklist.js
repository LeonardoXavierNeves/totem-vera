export function montarChecklist(servico) {
  const lista = [];

  servico.docsBasicos.forEach(d =>
    lista.push({ tipo: "basico", nome: d })
  );

  if (servico.docsExtras) {
    servico.docsExtras.forEach(d =>
      lista.push({ tipo: "extra", nome: d })
    );
  }

  return lista;
}