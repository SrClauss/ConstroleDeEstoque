import { Agriculture, Spa, Store, Category, ShoppingCart, RepeatOn, Home, Logout, SettingsOutlined, ShoppingCartCheckout, ManageSearchOutlined, Shop2 } from "@mui/icons-material";
import { NavigationContext } from "../../NavigationContext";
import './MenuBar.css';
import { Tooltip } from "@mui/material";
import React, { useRef, useEffect } from "react";

export default function MenuBar() {
    const { setActiveScreen } = React.useContext(NavigationContext);
    const menuBarRef = useRef(null);


    return (
        <div className="root-menu-bar" ref={menuBarRef}>
            <div className="menu-bar">
                <Tooltip title="Home" placement="bottom">
                    <div tabIndex={0} onClick={() => setActiveScreen("MainScreen")} className="button-menu-bar"><Home fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Cadastrar Pedido" placement="bottom">
                    <div tabIndex={1} onClick={() => setActiveScreen("PedidoUnico")} className="button-menu-bar"><ShoppingCart fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Cadastrar Pedido Recorrente" placement="bottom">
                    <div tabIndex={2} onClick={() => setActiveScreen("PedidoRecorrente")} className="button-menu-bar"><RepeatOn fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Compras" placement="bottom">
                    <div tabIndex={2} onClick={() => setActiveScreen("Compras")} className="button-menu-bar"><Shop2 fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Cadastrar Cliente" placement="bottom">
                    <div tabIndex={3} onClick={() => setActiveScreen("CadastroCliente")} className="button-menu-bar"><Store fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Cadastrar Fornecedor" placement="bottom">
                    <div tabIndex={4} onClick={() => setActiveScreen("CadastroFornecedor")} className="button-menu-bar"><Agriculture fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Cadastrar Categoria" placement="bottom">
                    <div tabIndex={5} onClick={() => setActiveScreen("CadastroCategoria")} className="button-menu-bar"><Category fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Cadastrar Produto" placement="bottom">
                    <div tabIndex={6} onClick={() => setActiveScreen("CadastroProduto")} className="button-menu-bar"><Spa fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Configurações" placement="bottom">
                    <div tabIndex={7} onClick={() => setActiveScreen("Configuracoes")} className="button-menu-bar"><SettingsOutlined fontSize="large" /></div>
                </Tooltip>
                <Tooltip title="Logout" placement="bottom">
                    <div tabIndex={8} onClick={() => setActiveScreen("Logout")} className="button-menu-bar"><Logout fontSize="large" /></div>
                </Tooltip>
            </div>
        </div>
    );
}