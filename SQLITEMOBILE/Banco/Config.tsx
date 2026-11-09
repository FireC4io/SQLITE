// ============================================================================
// Banco/Config.tsx
// ----------------------------------------------------------------------------
// Camada de acesso ao banco de dados SQLite.
// Segue o mesmo padrão do código de referência (uma função para cada
// operação: abrir banco, criar tabela, inserir, consultar, alterar, excluir),
// mas agora para a tabela LIVRO em vez da tabela USUARIO.
//
// Nenhuma tela executa SQL diretamente: todas chamam as funções deste arquivo.
// ============================================================================

// Biblioteca oficial do Expo para usar SQLite no celular
import * as SQLite from 'expo-sqlite';
// Lista com os livros de exemplo inseridos na primeira abertura do app
import { LIVROS_EXEMPLO } from './Seed';

//----------------------------------------------------------------------------
// TIPOS
//----------------------------------------------------------------------------

// Formato de um registro da tabela LIVRO exatamente como vem do banco.
// Os nomes das propriedades são iguais aos nomes das colunas,
// seguindo o padrão do código base (ID_US, NOME_US -> ID_LI, TITULO_LI...).
export type Livro = {
    ID_LI: number;       // chave primária, gerada automaticamente
    TITULO_LI: string;   // título do livro
    AUTOR_LI: string;    // nome do autor
    ANO_LI: number;      // ano de publicação
    GENERO_LI: string;   // gênero (Romance, Fantasia...)
};

// Dados usados para cadastrar/alterar: é o Livro sem o ID,
// porque o ID é criado pelo próprio banco (AUTOINCREMENT).
export type LivroInput = Omit<Livro, 'ID_LI'>;

//----------------------------------------------------------------------------
// ABRIR O BANCO
//----------------------------------------------------------------------------

// Guarda a conexão aberta. Assim o banco é aberto UMA vez só e todas as
// telas reaproveitam a mesma conexão (no código base, cada chamada a Banco()
// abria o arquivo de novo).
let conexao: Promise<SQLite.SQLiteDatabase> | null = null;

// Abre (ou cria, se não existir) o arquivo BIBLIOTECA.db.
// Na primeira vez também cria a tabela e insere os livros de exemplo.
// O arquivo fica salvo no armazenamento do app, por isso os dados
// continuam lá depois de fechar e abrir o aplicativo (persistência).
async function Banco(): Promise<SQLite.SQLiteDatabase> {
    if (!conexao) {
        conexao = (async () => {
            const db = await SQLite.openDatabaseAsync('BIBLIOTECA.db');
            console.log('Banco de dados aberto');
            await createTable(db); // garante que a tabela existe
            await seedLivros(db);  // insere os exemplos se a tabela estiver vazia
            return db;
        })().catch((error) => {
            // Se der erro ao abrir, limpa a variável para tentar de novo
            // na próxima chamada, e repassa o erro para a tela mostrar.
            conexao = null;
            console.log('Erro ao abrir banco', error);
            throw error;
        });
    }
    return conexao;
}

//----------------------------------------------------------------------------
// CRIAR TABELA
//----------------------------------------------------------------------------

// Cria a tabela LIVRO. O "IF NOT EXISTS" faz com que ela só seja criada
// na primeira vez; nas próximas aberturas o comando não faz nada e os
// dados já salvos são mantidos.
// NOT NULL impede gravar um livro com campo vazio direto no banco.
async function createTable(db: SQLite.SQLiteDatabase) {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS LIVRO (
            ID_LI     INTEGER PRIMARY KEY AUTOINCREMENT,
            TITULO_LI VARCHAR(150) NOT NULL,
            AUTOR_LI  VARCHAR(100) NOT NULL,
            ANO_LI    INTEGER      NOT NULL,
            GENERO_LI VARCHAR(50)  NOT NULL
        );
    `);
    console.log('Tabela LIVRO pronta');
}

//----------------------------------------------------------------------------
// DADOS DE EXEMPLO (requisito: pelo menos 10 registros)
//----------------------------------------------------------------------------

// Só insere os livros de exemplo se a tabela estiver vazia.
// Assim eles entram na primeira abertura e não são duplicados depois.
async function seedLivros(db: SQLite.SQLiteDatabase) {
    const total = await countLivros(db);
    if (total > 0) return; // já tem livros: não faz nada

    // withTransactionAsync agrupa todos os INSERTs em uma transação:
    // ou grava todos, ou nenhum (se algum falhar).
    await db.withTransactionAsync(async () => {
        for (const livro of LIVROS_EXEMPLO) {
            await insertLivro(db, livro);
        }
    });
    console.log(`${LIVROS_EXEMPLO.length} livros de exemplo inseridos`);
}

//----------------------------------------------------------------------------
// CREATE - Inserir novo livro
//----------------------------------------------------------------------------

// Os "?" são parâmetros: o SQLite troca cada "?" pelo valor correspondente
// de forma segura, o que evita SQL Injection (nunca juntamos texto do
// usuário direto na string do SQL).
// Retorna o ID gerado para o livro novo.
async function insertLivro(db: SQLite.SQLiteDatabase, livro: LivroInput) {
    const result = await db.runAsync(
        'INSERT INTO LIVRO (TITULO_LI, AUTOR_LI, ANO_LI, GENERO_LI) VALUES (?, ?, ?, ?)',
        livro.TITULO_LI, livro.AUTOR_LI, livro.ANO_LI, livro.GENERO_LI
    );
    console.log('Livro inserido');
    return result.lastInsertRowId;
}

//----------------------------------------------------------------------------
// READ - Consultas
//----------------------------------------------------------------------------

// Conta quantos livros existem. Usado para:
//  - saber quantas páginas a lista tem (total / livros por página)
//  - saber se precisa inserir os livros de exemplo
async function countLivros(db: SQLite.SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{ TOTAL: number }>(
        'SELECT COUNT(*) AS TOTAL FROM LIVRO'
    );
    return row?.TOTAL ?? 0; // se não vier nada, considera 0
}

// PAGINAÇÃO: busca só os livros de uma página.
//  - LIMIT  = quantos registros trazer (ex.: 5)
//  - OFFSET = quantos registros pular antes de começar
// Exemplo com 5 por página:
//  página 1 -> OFFSET 0  (registros 1 a 5)
//  página 2 -> OFFSET 5  (registros 6 a 10)
//  página 3 -> OFFSET 10 (registros 11 a 15)
// ORDER BY ID_LI DESC mostra os livros mais recentes primeiro.
async function selectLivrosPaginado(
    db: SQLite.SQLiteDatabase, pagina: number, porPagina: number
): Promise<Livro[]> {
    const offset = (pagina - 1) * porPagina;
    return db.getAllAsync<Livro>(
        'SELECT * FROM LIVRO ORDER BY ID_LI DESC LIMIT ? OFFSET ?',
        porPagina, offset
    );
}

// Busca um livro pelo ID. Usado na tela de edição para preencher o
// formulário com os dados atuais. Retorna null se não encontrar.
async function selectLivroById(db: SQLite.SQLiteDatabase, id: number) {
    return db.getFirstAsync<Livro>('SELECT * FROM LIVRO WHERE ID_LI = ?', id);
}

//----------------------------------------------------------------------------
// UPDATE - Alterar livro
//----------------------------------------------------------------------------

// Atualiza todos os campos do livro que tem o ID informado.
// O WHERE é essencial: sem ele, TODOS os livros seriam alterados.
async function updateLivro(db: SQLite.SQLiteDatabase, id: number, livro: LivroInput) {
    await db.runAsync(
        'UPDATE LIVRO SET TITULO_LI = ?, AUTOR_LI = ?, ANO_LI = ?, GENERO_LI = ? WHERE ID_LI = ?',
        livro.TITULO_LI, livro.AUTOR_LI, livro.ANO_LI, livro.GENERO_LI, id
    );
    console.log('Livro atualizado');
}

//----------------------------------------------------------------------------
// DELETE - Excluir livro
//----------------------------------------------------------------------------

// Remove o livro com o ID informado (o WHERE garante que só ele é apagado).
async function deleteLivro(db: SQLite.SQLiteDatabase, id: number) {
    await db.runAsync('DELETE FROM LIVRO WHERE ID_LI = ?', id);
    console.log('Livro excluido');
}

// Exporta as funções para as telas poderem usar
export {
    Banco, createTable, insertLivro, countLivros, selectLivrosPaginado,
    selectLivroById, updateLivro, deleteLivro
};
