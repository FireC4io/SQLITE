// ============================================================================
// src/tema.ts
// ----------------------------------------------------------------------------
// Constantes visuais e de configuração usadas em várias telas.
// Centralizar aqui evita repetir códigos de cor espalhados pelo projeto:
// para mudar a cor principal do app, basta alterar um valor.
// ============================================================================

// Paleta de cores do app
export const cores = {
    primaria: '#4F46E5',      // roxo/azul: cabeçalho e botões principais
    primariaClara: '#EEF2FF', // fundo das etiquetas e do botão Editar
    perigo: '#DC2626',        // vermelho: botão Excluir e mensagens de erro
    fundo: '#F3F4F6',         // cinza claro: fundo das telas
    cartao: '#FFFFFF',        // branco: cards e campos de texto
    texto: '#111827',         // texto principal
    textoSuave: '#6B7280',    // textos secundários (autor, contador...)
    borda: '#E5E7EB',         // bordas dos cards e campos
    desabilitado: '#C7C9D1',  // botões desabilitados
} as const; // "as const" deixa os valores fixos (somente leitura)

// Quantidade de livros mostrados em cada página da listagem
export const POR_PAGINA = 5;
