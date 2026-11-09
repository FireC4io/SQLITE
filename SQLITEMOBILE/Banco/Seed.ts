// ============================================================================
// Banco/Seed.ts
// ----------------------------------------------------------------------------
// "Seed" = dados iniciais. Esta lista é inserida automaticamente no banco
// na PRIMEIRA vez que o app é aberto (quando a tabela LIVRO está vazia),
// atendendo ao requisito de "cadastro e demonstração de pelo menos 10
// registros". São 12 livros, o que gera 3 páginas na listagem (5 por página).
//
// Quem faz a inserção é a função seedLivros() em Banco/Config.tsx.
// ============================================================================

// "import type" importa só o tipo (não gera código no app final)
import type { LivroInput } from './Config';

// readonly impede que a lista seja alterada por engano em outro lugar
export const LIVROS_EXEMPLO: readonly LivroInput[] = [
    { TITULO_LI: 'Dom Casmurro', AUTOR_LI: 'Machado de Assis', ANO_LI: 1899, GENERO_LI: 'Romance' },
    { TITULO_LI: 'O Cortiço', AUTOR_LI: 'Aluísio Azevedo', ANO_LI: 1890, GENERO_LI: 'Romance' },
    { TITULO_LI: 'Vidas Secas', AUTOR_LI: 'Graciliano Ramos', ANO_LI: 1938, GENERO_LI: 'Romance' },
    { TITULO_LI: 'Grande Sertão: Veredas', AUTOR_LI: 'João Guimarães Rosa', ANO_LI: 1956, GENERO_LI: 'Romance' },
    { TITULO_LI: 'A Hora da Estrela', AUTOR_LI: 'Clarice Lispector', ANO_LI: 1977, GENERO_LI: 'Romance' },
    { TITULO_LI: '1984', AUTOR_LI: 'George Orwell', ANO_LI: 1949, GENERO_LI: 'Ficção científica' },
    { TITULO_LI: 'O Senhor dos Anéis', AUTOR_LI: 'J. R. R. Tolkien', ANO_LI: 1954, GENERO_LI: 'Fantasia' },
    { TITULO_LI: 'O Pequeno Príncipe', AUTOR_LI: 'Antoine de Saint-Exupéry', ANO_LI: 1943, GENERO_LI: 'Infantil' },
    { TITULO_LI: 'Sapiens', AUTOR_LI: 'Yuval Noah Harari', ANO_LI: 2011, GENERO_LI: 'História' },
    { TITULO_LI: 'O Hobbit', AUTOR_LI: 'J. R. R. Tolkien', ANO_LI: 1937, GENERO_LI: 'Fantasia' },
    { TITULO_LI: 'Capitães da Areia', AUTOR_LI: 'Jorge Amado', ANO_LI: 1937, GENERO_LI: 'Romance' },
    { TITULO_LI: 'Memórias Póstumas de Brás Cubas', AUTOR_LI: 'Machado de Assis', ANO_LI: 1881, GENERO_LI: 'Romance' },
];
