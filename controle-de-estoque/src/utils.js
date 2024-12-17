export function maskTelefone(telefone) {
    if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else {
      return telefone;
    }
  }
export function maskCpfCnpj(cpf_cnpj) {
    if (cpf_cnpj.length === 11) {
      return cpf_cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (cpf_cnpj.length === 14) {
      return cpf_cnpj.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    } else {
      return cpf_cnpj;
    }
  }