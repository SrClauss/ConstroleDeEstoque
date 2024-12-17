import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import {NavigationProvider, NavigationContext} from "./NavigationContext";
import LoginScreen from "./Screens/LoginScreen/LoginScreen";
import MainScreen from "./Screens/MainScreen/MainScreen";
import { createTheme, ThemeProvider } from '@mui/material';
import React from "react";
import CadastroCliente from "./Screens/CadastroCliente/CadastroCliente";
import CadastroCategoria from "./Screens/CadastroCategoria/CadastroCategoria";
import CadastroFornecedor from "./Screens/CadastroFornecedor/CadastroFornecedor";
import CadastroProduto from "./Screens/CadastroProduto/CadastroProduto";
import PedidoRecorrente from "./Screens/PedidoRecorrente/PedidoRecorrente";
import PedidoUnico from "./Screens/PedidoUnico/PedidoUnico";
import Compras from "./Screens/Compras/Compras";
import Configuracoes from "./Screens/Configuracoes/Configuracoes";



const App = () => {
  const theme = createTheme({
    palette: {
      primary: { main: '#549b86' },
      secondary: { main: '#045b1c' },
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          root: { color: '#003000', borderRadius: '5px' },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <NavigationProvider>
        <ScreenRenderer />
      </NavigationProvider>
      
    </ThemeProvider>
  );
};

const ScreenRenderer = () => {
  const { activeScreen } = React.useContext(NavigationContext);

  switch (activeScreen) {
    case 'MainScreen':
      return <MainScreen />;
    case 'LoginScreen':
      return <LoginScreen />;
    case 'CadastroCliente':
      return <CadastroCliente />;
    case 'CadastroCategoria':
      return <CadastroCategoria />;
    case 'CadastroFornecedor':
      return <CadastroFornecedor />;
    case 'CadastroProduto':
      return <CadastroProduto />;
    case 'PedidoRecorrente':
      return <PedidoRecorrente />;
    case 'PedidoUnico':
      return <PedidoUnico />;
    case 'Configuracoes':
      return <Configuracoes />;
    case 'Compras':
      return <Compras />;
    default :
      return <LoginScreen />;

  }

};



export default App;
