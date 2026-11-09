// ============================================================================
// src/navegacao.ts
// ----------------------------------------------------------------------------
// Tipos da navegação entre telas (React Navigation).
// Aqui dizemos quais telas existem e quais parâmetros cada uma recebe.
// Com isso o TypeScript avisa se navegarmos para uma tela que não existe
// ou se passarmos um parâmetro errado.
// ============================================================================

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Telas do app:
//  - Lista:      não recebe parâmetros
//  - Formulario: pode receber um "id".
//      * sem id  -> modo CADASTRO (livro novo)
//      * com id  -> modo EDIÇÃO   (carrega o livro com esse id)
export type RootStackParamList = {
    Lista: undefined;
    Formulario: { id?: number } | undefined;
};

// Props que cada tela recebe automaticamente do navegador:
//  - navigation: para trocar de tela (navigate, goBack...)
//  - route:      para ler os parâmetros recebidos (route.params)
export type ListaProps = NativeStackScreenProps<RootStackParamList, 'Lista'>;
export type FormularioProps = NativeStackScreenProps<RootStackParamList, 'Formulario'>;
