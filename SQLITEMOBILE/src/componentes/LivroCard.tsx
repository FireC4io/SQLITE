// ============================================================================
// src/componentes/LivroCard.tsx
// ----------------------------------------------------------------------------
// Componente que desenha UM livro da lista (um "card").
// Mostra título, autor, gênero, ano e ID, e tem os botões Editar e Excluir.
//
// O card NÃO acessa o banco: ele só avisa a tela de lista que um botão
// foi tocado (pelas funções onEditar/onExcluir). Quem decide o que fazer
// é a tela. Isso deixa o componente simples e reaproveitável.
// ============================================================================

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Livro } from '../../Banco/Config';
import { cores } from '../tema';

// Propriedades (props) que o card recebe de quem o usa
type LivroCardProps = {
    livro: Livro;                        // o livro a ser exibido
    onEditar: (id: number) => void;      // chamada ao tocar em "Editar"
    onExcluir: (livro: Livro) => void;   // chamada ao tocar em "Excluir"
};

export function LivroCard({ livro, onEditar, onExcluir }: LivroCardProps) {
    return (
        <View style={styles.card}>
            {/* Lado esquerdo: informações do livro */}
            <View style={styles.info}>
                <Text style={styles.titulo}>{livro.TITULO_LI}</Text>
                <Text style={styles.autor}>{livro.AUTOR_LI}</Text>
                <View style={styles.tags}>
                    <Text style={styles.tag}>{livro.GENERO_LI}</Text>
                    <Text style={styles.ano}>{livro.ANO_LI}</Text>
                    <Text style={styles.id}>#{livro.ID_LI}</Text>
                </View>
            </View>

            {/* Lado direito: botões de ação */}
            <View style={styles.acoes}>
                {/* Pressable = área tocável. accessibilityLabel é o texto
                    lido pelo leitor de tela (acessibilidade). */}
                <Pressable
                    style={[styles.botao, styles.editar]}
                    onPress={() => onEditar(livro.ID_LI)}
                    accessibilityLabel={`Editar ${livro.TITULO_LI}`}
                >
                    <Text style={styles.textoEditar}>Editar</Text>
                </Pressable>
                <Pressable
                    style={[styles.botao, styles.excluir]}
                    onPress={() => onExcluir(livro)}
                    accessibilityLabel={`Excluir ${livro.TITULO_LI}`}
                >
                    <Text style={styles.textoExcluir}>Excluir</Text>
                </Pressable>
            </View>
        </View>
    );
}

// Estilos do card (StyleSheet.create organiza e otimiza os estilos)
const styles = StyleSheet.create({
    // Caixa branca com borda arredondada; flexDirection 'row' coloca
    // as informações e os botões lado a lado
    card: {
        flexDirection: 'row',
        backgroundColor: cores.cartao,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: cores.borda,
    },
    info: { flex: 1, paddingRight: 8 }, // flex: 1 ocupa o espaço que sobrar
    titulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
    autor: { fontSize: 14, color: cores.textoSuave, marginTop: 2 },
    tags: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
    // Etiqueta arredondada do gênero (borderRadius 999 = formato de pílula)
    tag: {
        backgroundColor: cores.primariaClara,
        color: cores.primaria,
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
    },
    ano: { fontSize: 12, color: cores.textoSuave },
    id: { fontSize: 12, color: cores.desabilitado },
    acoes: { justifyContent: 'center', gap: 6 },
    botao: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
    editar: { backgroundColor: cores.primariaClara },
    excluir: { backgroundColor: '#FEE2E2' }, // vermelho bem claro
    textoEditar: { color: cores.primaria, fontWeight: '600', fontSize: 13 },
    textoExcluir: { color: cores.perigo, fontWeight: '600', fontSize: 13 },
});
