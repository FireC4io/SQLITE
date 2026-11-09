// ============================================================================
// App.tsx
// ----------------------------------------------------------------------------
// Ponto de entrada do aplicativo (substitui o App.js do código base).
// Aqui só configuramos a NAVEGAÇÃO entre as duas telas:
//
//   Lista (ListaLivros)  --"+ Novo livro" / "Editar"-->  Formulario (FormularioLivro)
//                        <--------- Salvar / Cancelar ---
//
// O banco não é aberto aqui: cada tela chama Banco() quando precisa
// (a conexão é aberta uma vez só, ver Banco/Config.tsx).
// ============================================================================

import { StatusBar } from 'expo-status-bar';
// NavigationContainer: "caixa" que controla toda a navegação do app
import { NavigationContainer } from '@react-navigation/native';
// SafeAreaProvider: calcula as áreas seguras da tela (barra de status e
// barra de gestos) para as telas poderem se afastar delas
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Navegação em pilha: uma tela abre "por cima" da outra, com botão voltar
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ListaLivros } from './src/telas/ListaLivros';
import { FormularioLivro } from './src/telas/FormularioLivro';
import type { RootStackParamList } from './src/navegacao';
import { cores } from './src/tema';

// Cria o navegador já sabendo quais telas existem (RootStackParamList)
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      {/* Ícones da barra de status (hora, bateria) em branco,
          para aparecerem sobre o cabeçalho roxo */}
      <StatusBar style="light" />

      {/* screenOptions vale para todas as telas: cabeçalho roxo e texto branco */}
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {/* A primeira tela declarada é a que abre ao iniciar o app */}
        <Stack.Screen name="Lista" component={ListaLivros} options={{ title: '📚 Minha Biblioteca' }} />
        {/* O título desta tela muda para "Editar livro" no modo edição */}
        <Stack.Screen name="Formulario" component={FormularioLivro} options={{ title: 'Novo livro' }} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
