// ============================================================================
// src/telas/FormularioLivro.tsx
// ----------------------------------------------------------------------------
// TELA DE FORMULÁRIO, usada para duas coisas:
//  - CREATE (cadastrar): aberta SEM id  -> campos vazios -> insertLivro
//  - UPDATE (editar):    aberta COM id  -> campos preenchidos -> updateLivro
// Usar a mesma tela para os dois casos evita duplicar código.
// ============================================================================

import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable,
    ScrollView, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions,
} from 'react-native';
import {
    Banco, insertLivro, selectLivroById, updateLivro,
} from '../../Banco/Config';
import type { FormularioProps } from '../navegacao';
import { cores } from '../tema';
import { validarLivro, type FormLivro } from '../validacao';

// Valores iniciais do formulário em modo cadastro (tudo vazio)
const FORM_VAZIO: FormLivro = { titulo: '', autor: '', ano: '', genero: '' };

// ----------------------------------------------------------------------------
// Componente Campo: um rótulo + caixa de texto + mensagem de erro.
// Criado para não repetir o mesmo bloco 4 vezes (um para cada campo).
// ----------------------------------------------------------------------------
type CampoProps = {
    rotulo: string;                  // texto acima da caixa (ex.: "Título")
    valor: string;                   // texto atual digitado
    erro?: string;                   // mensagem de erro (opcional)
    placeholder: string;             // dica mostrada com a caixa vazia
    teclado?: KeyboardTypeOptions;   // tipo de teclado (ex.: só números)
    maxLength: number;               // limite de caracteres
    onChange: (texto: string) => void; // chamada a cada letra digitada
};

function Campo({ rotulo, valor, erro, placeholder, teclado, maxLength, onChange }: CampoProps) {
    return (
        <View style={styles.campo}>
            <Text style={styles.rotulo}>{rotulo}</Text>
            <TextInput
                // Se houver erro, a borda da caixa fica vermelha
                style={[styles.input, erro && styles.inputErro]}
                value={valor}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={cores.desabilitado}
                keyboardType={teclado}
                maxLength={maxLength}
            />
            {/* Mensagem de erro abaixo da caixa, só se existir */}
            {erro && <Text style={styles.textoErro}>{erro}</Text>}
        </View>
    );
}

// ----------------------------------------------------------------------------
// Tela do formulário
// ----------------------------------------------------------------------------
export function FormularioLivro({ navigation, route }: FormularioProps) {
    // Lê o id recebido pela navegação (pode não existir).
    // Se existe id, estamos editando; se não, cadastrando.
    const id = route.params?.id;
    const editando = id !== undefined;

    // Estados da tela
    const [form, setForm] = useState<FormLivro>(FORM_VAZIO); // valores digitados
    const [erros, setErros] = useState<Partial<Record<keyof FormLivro, string>>>({}); // erros por campo
    const [carregando, setCarregando] = useState(editando);  // carregando dados do livro (só na edição)
    const [salvando, setSalvando] = useState(false);         // evita tocar em "Salvar" duas vezes

    // Muda o título do cabeçalho conforme o modo
    useEffect(() => {
        navigation.setOptions({ title: editando ? 'Editar livro' : 'Novo livro' });
    }, [navigation, editando]);

    // MODO EDIÇÃO: busca o livro no banco (READ por ID) e preenche os campos
    useEffect(() => {
        if (id === undefined) return; // modo cadastro: não precisa buscar nada
        (async () => {
            try {
                const db = await Banco();
                const livro = await selectLivroById(db, id);
                if (!livro) {
                    // O livro pode ter sido excluído: avisa e volta para a lista
                    Alert.alert('Aviso', 'Livro não encontrado.');
                    navigation.goBack();
                    return;
                }
                // Coloca os dados do banco nos campos (o ano vira texto
                // porque o TextInput só trabalha com string)
                setForm({
                    titulo: livro.TITULO_LI,
                    autor: livro.AUTOR_LI,
                    ano: String(livro.ANO_LI),
                    genero: livro.GENERO_LI,
                });
            } catch (e) {
                console.error('Erro ao carregar livro', e);
                Alert.alert('Erro', 'Não foi possível carregar o livro.');
            } finally {
                setCarregando(false);
            }
        })();
    }, [id, navigation]);

    // Cria a função que atualiza UM campo do formulário.
    // Ex.: alterar('titulo') devolve a função usada no campo Título.
    // Usamos { ...atual, [campo]: texto } para criar um objeto NOVO com o
    // campo alterado (o React só redesenha a tela quando o objeto muda).
    // Também apaga o erro daquele campo assim que o usuário volta a digitar.
    const alterar = (campo: keyof FormLivro) => (texto: string) => {
        setForm((atual) => ({ ...atual, [campo]: texto }));
        setErros((atual) => ({ ...atual, [campo]: undefined }));
    };

    // Botão Salvar: valida e grava no banco
    const salvar = async () => {
        // 1) Valida os campos (src/validacao.ts)
        const resultado = validarLivro(form);
        if (!resultado.ok) {
            setErros(resultado.erros); // mostra os erros embaixo de cada campo
            return;                    // e não salva nada
        }

        // 2) Grava no banco
        setSalvando(true);
        try {
            const db = await Banco();
            if (editando) await updateLivro(db, id, resultado.livro); // UPDATE
            else await insertLivro(db, resultado.livro);              // CREATE

            // 3) Volta para a lista, que recarrega sozinha (useFocusEffect)
            navigation.goBack();
        } catch (e) {
            console.error('Erro ao salvar livro', e);
            Alert.alert('Erro', 'Não foi possível salvar o livro.');
            setSalvando(false); // libera o botão para tentar de novo
        }
    };

    // Enquanto busca o livro (modo edição), mostra o indicador girando
    if (carregando) {
        return <ActivityIndicator size="large" color={cores.primaria} style={styles.loading} />;
    }

    return (
        // KeyboardAvoidingView: no iPhone, empurra o conteúdo para cima
        // quando o teclado abre, para ele não cobrir os campos
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* ScrollView permite rolar o formulário em telas pequenas.
                keyboardShouldPersistTaps="handled" deixa tocar no botão
                sem precisar fechar o teclado antes */}
            <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
                <Campo rotulo="Título" valor={form.titulo} erro={erros.titulo}
                    placeholder="Ex.: Dom Casmurro" maxLength={150} onChange={alterar('titulo')} />
                <Campo rotulo="Autor" valor={form.autor} erro={erros.autor}
                    placeholder="Ex.: Machado de Assis" maxLength={100} onChange={alterar('autor')} />
                {/* teclado "number-pad" abre só o teclado numérico */}
                <Campo rotulo="Ano de publicação" valor={form.ano} erro={erros.ano}
                    placeholder="Ex.: 1899" teclado="number-pad" maxLength={4} onChange={alterar('ano')} />
                <Campo rotulo="Gênero" valor={form.genero} erro={erros.genero}
                    placeholder="Ex.: Romance" maxLength={50} onChange={alterar('genero')} />

                {/* Botão principal: o texto muda conforme o modo e o estado */}
                <Pressable
                    style={[styles.botao, salvando && styles.botaoDesabilitado]}
                    onPress={salvar}
                    disabled={salvando}
                >
                    <Text style={styles.textoBotao}>
                        {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar livro'}
                    </Text>
                </Pressable>

                {/* Cancelar: volta para a lista sem salvar nada */}
                <Pressable style={styles.cancelar} onPress={() => navigation.goBack()}>
                    <Text style={styles.textoCancelar}>Cancelar</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo },
    conteudo: { padding: 16 },
    loading: { flex: 1 },
    campo: { marginBottom: 14 },
    rotulo: { fontWeight: '600', color: cores.texto, marginBottom: 6 },
    input: {
        backgroundColor: cores.cartao,
        borderWidth: 1,
        borderColor: cores.borda,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: cores.texto,
    },
    inputErro: { borderColor: cores.perigo }, // borda vermelha quando há erro
    textoErro: { color: cores.perigo, fontSize: 12, marginTop: 4 },
    botao: {
        backgroundColor: cores.primaria,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    botaoDesabilitado: { backgroundColor: cores.desabilitado },
    textoBotao: { color: '#fff', fontWeight: '700', fontSize: 16 },
    cancelar: { alignItems: 'center', paddingVertical: 14 },
    textoCancelar: { color: cores.textoSuave, fontWeight: '600' },
});
