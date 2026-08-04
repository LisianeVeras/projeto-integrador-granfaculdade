// Máscaras e formatações usadas nas telas

export function apenasDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

// 11222333000181 vira 11.222.333/0001-81
export function mascaraCnpj(valor) {
  const d = apenasDigitos(valor).slice(0, 14);

  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// 1133334444 vira (11) 3333-4444
export function mascaraTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11);

  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }

  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

// 8.9 vira R$ 8,90
export function formatarMoeda(valor) {
  const numero = Number(valor);

  if (isNaN(numero)) return '-';

  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// 2027-06-30 vira 30/06/2027
export function formatarData(valor) {
  if (!valor) return '-';

  const [ano, mes, dia] = String(valor).split('-');

  return `${dia}/${mes}/${ano}`;
}
