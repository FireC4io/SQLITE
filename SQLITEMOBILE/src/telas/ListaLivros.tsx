// ============================================================================
// src/telas/ListaLivros.tsx
// ----------------------------------------------------------------------------
// TELA PRINCIPAL: listagem dos livros (READ), com paginação e exclusão
// (DELETE). Também tem o botão "+ Novo livro" que abre o formulário
// (CREATE) e o botão "Editar" de cada card que abre o formulário em modo
// edição (UPDATE).
// ============================================================================

import { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View,
} from 'react-native';
// useFocusEffect: executa um código toda vez que a tela fica visível
import { useFocusEffect } from '@react-navigation/native';
// useSafeAreaInsets: informa o tamanho das áreas do sistema (barra de
// gestos/navegação do Android) para o conteúdo não ficar por baixo delas
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Funções do banco (Banco/Config.tsx)
import {
    Banco, countLivros, deleteLivro, selectLivrosPaginado, type Livro,
} from '../../Banco/Config';
import { LivroCard } from '../componentes/LivroCard';
import { Paginacao } from '../componentes/Paginacao';
import type { ListaProps } from '../navegacao';
import { cores, POR_PAGINA } from '../tema';

export function ListaLivros({ navigation }: ListaProps) {
    // Espaço ocupado pela barra de gestos do Android na parte de baixo
    const insets = useSafeAreaInsets();

    // ---------------------------------------------------------------------
    // ESTADOS DA TELA (useState guarda valores que, ao mudar, redesenham a tela)
    // ---------------------------------------------------------------------
    const [pagina, setPagina] = useState(1);              // página atual
    const [livros, setLivros] = useState<Livro[]>([]);    // livros da página atual
    const [total, setTotal] = useState(0);                // total de livros no banco
    const [carregando, setCarregando] = useState(true);   // mostra o "carregando..."
    const [erro, setErro] = useState<string | null>(null); // mensagem de erro, se houver

    // Total de páginas = total de livros dividido por livros por página,
    // arredondado para cima (ex.: 12 livros / 5 = 2,4 -> 3 páginas).
    // Math.max(1, ...) garante pelo menos "Página 1 de 1" com a lista vazia.
    const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

    // ---------------------------------------------------------------------
    // READ: busca no banco os livros da página pedida
    // ---------------------------------------------------------------------
    // useCallback mantém a mesma função entre as renderizações
    // (necessário para o useFocusEffect abaixo não entrar em loop).
    const carregar = useCallback(async (paginaDesejada: number) => {
        setCarregando(true);
        setErro(null);
        try {
            const db = await Banco();
            const novoTotal = await countLivros(db);

            // Proteção: se a página pedida não existe mais (ex.: estava na
            // página 3, excluiu o único livro dela), volta para a última
            // página que ainda tem livros.
            const ultima = Math.max(1, Math.ceil(novoTotal / POR_PAGINA));
            const paginaValida = Math.min(paginaDesejada, ultima);

            // Busca só os 5 livros da página (LIMIT/OFFSET no SQL)
            const dados = await selectLivrosPaginado(db, paginaValida, POR_PAGINA);

            // Atualiza a tela com os dados novos
            setTotal(novoTotal);
            setPagina(paginaValida);
            setLivros(dados);
        } catch (e) {
            console.error('Erro ao carregar livros', e);
            setErro('Não foi possível carregar os livros.');
        } finally {
            // finally roda com ou sem erro: sempre esconde o "carregando"
            setCarregando(false);
        }
    }, []);

    // Recarrega a lista:
    //  - quando a tela aparece pela primeira vez
    //  - quando voltamos do formulário (depois de cadastrar/editar)
    //  - quando a página muda (botões Anterior/Próxima alteram "pagina")
    useFocusEffect(
        useCallback(() => {
            carregar(pagina);
        }, [carregar, pagina])
    );

    // ---------------------------------------------------------------------
    // DELETE: exclui o livro e recarrega a lista
    // ---------------------------------------------------------------------
    const excluir = async (livro: Livro) => {
        try {
            const db = await Banco();
            await deleteLivro(db, livro.ID_LI);
            await carregar(pagina); // atualiza a lista e o contador
        } catch (e) {
            console.error('Erro ao excluir livro', e);
            Alert.alert('Erro', 'Não foi possível excluir o livro.');
        }
    };

    // Antes de excluir, pede confirmação para evitar exclusão acidental.
    // Só chama excluir() se o usuário tocar em "Excluir" no alerta.
    const confirmarExclusao = (livro: Livro) => {
        Alert.alert(
            'Excluir livro',
            `Deseja realmente excluir "${livro.TITULO_LI}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: () => excluir(livro) },
            ]
        );
    };

    // ---------------------------------------------------------------------
    // INTERFACE
    // ---------------------------------------------------------------------
    return (
        // paddingBottom = insets.bottom: afasta a paginação da barra de gestos
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            {/* Cabeçalho: contador de livros + botão de cadastro */}
            <View style={styles.cabecalho}>
                <Text style={styles.contador}>
                    {total} {total === 1 ? 'livro cadastrado' : 'livros cadastrados'}
                </Text>
                {/* CREATE: abre o formulário SEM id = modo cadastro */}
                <Pressable
                    style={styles.botaoNovo}
                    onPress={() => navigation.navigate('Formulario')}
                    accessibilityLabel="Cadastrar novo livro"
                >
                    <Text style={styles.textoNovo}>+ Novo livro</Text>
                </Pressable>
            </View>

            {/* Mensagem de erro (só aparece se "erro" tiver valor) */}
            {erro && <Text style={styles.erro}>{erro}</Text>}

            {/* Enquanto carrega pela primeira vez, mostra o indicador girando;
                depois mostra a lista */}
            {carregando && livros.length === 0 ? (
                <ActivityIndicator size="large" color={cores.primaria} style={styles.loading} />
            ) : (
                // FlatList: componente de lista otimizado do React Native
                <FlatList
                    data={livros}                                // livros da página atual
                    keyExtractor={(item) => String(item.ID_LI)}  // chave única de cada item
                    renderItem={({ item }) => (
                        <LivroCard
                            livro={item}
                            // UPDATE: abre o formulário COM id = modo edição
                            onEditar={(id) => navigation.navigate('Formulario', { id })}
                            onExcluir={confirmarExclusao}
                        />
                    )}
                    // Mostrado quando não há nenhum livro
                    ListEmptyComponent={
                        <Text style={styles.vazio}>
                            Nenhum livro cadastrado. Toque em "+ Novo livro".
                        </Text>
                    }
                    contentContainerStyle={styles.lista}
                />
            )}

            {/* Paginação: ao trocar de página, setPagina muda o estado,
                e o useFocusEffect acima busca os livros da nova página */}
            <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: 16 },
    cabecalho: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    contador: { color: cores.textoSuave, fontWeight: '600' },
    botaoNovo: {
        backgroundColor: cores.primaria,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    textoNovo: { color: '#fff', fontWeight: '700' },
    lista: { flexGrow: 1 },
    loading: { flex: 1 },
    vazio: { textAlign: 'center', color: cores.textoSuave, marginTop: 40 },
    erro: { color: cores.perigo, marginBottom: 8 },
});
