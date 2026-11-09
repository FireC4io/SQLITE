// ============================================================================
// src/componentes/Paginacao.tsx
// ----------------------------------------------------------------------------
// Barra de paginação mostrada embaixo da lista:
//
//     [‹ Anterior]    Página 2 de 3    [Próxima ›]
//
// O componente só mostra os botões e avisa qual página foi escolhida
// (onMudar). Quem busca os livros da nova página no banco é a tela de lista.
// ============================================================================

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';

type PaginacaoProps = {
    pagina: number;                    // página atual (começa em 1)
    totalPaginas: number;              // quantidade total de páginas
    onMudar: (pagina: number) => void; // chamada com a nova página escolhida
};

export function Paginacao({ pagina, totalPaginas, onMudar }: PaginacaoProps) {
    // Na primeira página não existe "anterior";
    // na última página não existe "próxima".
    const temAnterior = pagina > 1;
    const temProxima = pagina < totalPaginas;

    return (
        <View style={styles.container}>
            {/* Botão Anterior: desabilitado (cinza) na primeira página */}
            <Pressable
                style={[styles.botao, !temAnterior && styles.desabilitado]}
                disabled={!temAnterior}
                onPress={() => onMudar(pagina - 1)}
                accessibilityLabel="Página anterior"
            >
                <Text style={styles.textoBotao}>‹ Anterior</Text>
            </Pressable>

            {/* Indicador de posição */}
            <Text style={styles.indicador}>
                Página {pagina} de {totalPaginas}
            </Text>

            {/* Botão Próxima: desabilitado (cinza) na última página */}
            <Pressable
                style={[styles.botao, !temProxima && styles.desabilitado]}
                disabled={!temProxima}
                onPress={() => onMudar(pagina + 1)}
                accessibilityLabel="Próxima página"
            >
                <Text style={styles.textoBotao}>Próxima ›</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    // Botões nas pontas e o indicador no meio (space-between)
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    botao: {
        backgroundColor: cores.primaria,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    desabilitado: { backgroundColor: cores.desabilitado },
    textoBotao: { color: '#fff', fontWeight: '600' },
    indicador: { color: cores.texto, fontWeight: '600' },
});
