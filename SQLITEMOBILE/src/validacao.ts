// ============================================================================
// src/validacao.ts
// ----------------------------------------------------------------------------
// Valida os dados digitados no formulário ANTES de salvar no banco.
// Fica separado da tela para deixar o código do formulário mais limpo
// e para a regra de validação ficar em um lugar só.
// ============================================================================

import type { LivroInput } from '../Banco/Config';

// Valores do formulário. Tudo é string porque é o que o TextInput devolve
// (o ano só vira número depois de validado).
export type FormLivro = {
    titulo: string;
    autor: string;
    ano: string;
    genero: string;
};

// Resultado da validação. Pode ser de dois jeitos:
//  - ok: true  -> dados válidos, já convertidos para gravar no banco
//  - ok: false -> lista de mensagens de erro, uma por campo com problema
// Partial<Record<...>> = objeto que PODE ter uma chave para cada campo.
export type ResultadoValidacao =
    | { ok: true; livro: LivroInput }
    | { ok: false; erros: Partial<Record<keyof FormLivro, string>> };

// Menor ano aceito no campo "Ano de publicação"
const ANO_MINIMO = 0;

// Confere cada campo e devolve os erros encontrados ou o livro pronto
export function validarLivro(form: FormLivro): ResultadoValidacao {
    const erros: Partial<Record<keyof FormLivro, string>> = {};

    // trim() remove espaços do começo e do fim, para "   " contar como vazio
    const titulo = form.titulo.trim();
    const autor = form.autor.trim();
    const genero = form.genero.trim();
    const anoAtual = new Date().getFullYear();
    const ano = Number(form.ano.trim()); // converte o texto em número

    // Título: obrigatório e com no máximo 150 caracteres (tamanho da coluna)
    if (!titulo) erros.titulo = 'Informe o título.';
    else if (titulo.length > 150) erros.titulo = 'Máximo de 150 caracteres.';

    // Autor: obrigatório, máximo 100 caracteres
    if (!autor) erros.autor = 'Informe o autor.';
    else if (autor.length > 100) erros.autor = 'Máximo de 100 caracteres.';

    // Ano: obrigatório, número inteiro e não pode ser no futuro
    if (!form.ano.trim()) erros.ano = 'Informe o ano.';
    else if (!Number.isInteger(ano) || ano < ANO_MINIMO || ano > anoAtual) {
        erros.ano = `Ano deve estar entre ${ANO_MINIMO} e ${anoAtual}.`;
    }

    // Gênero: obrigatório, máximo 50 caracteres
    if (!genero) erros.genero = 'Informe o gênero.';
    else if (genero.length > 50) erros.genero = 'Máximo de 50 caracteres.';

    // Se encontrou algum erro, devolve os erros para a tela mostrar
    if (Object.keys(erros).length > 0) return { ok: false, erros };

    // Tudo certo: monta o objeto no formato das colunas da tabela
    return {
        ok: true,
        livro: { TITULO_LI: titulo, AUTOR_LI: autor, ANO_LI: ano, GENERO_LI: genero },
    };
}
