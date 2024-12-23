import CadastroContainer from "../../Components/CadastroContainer/CadastroContainer";
import React from "react";
import RootScreen from "../RootScreen/RootScreen";

export default function MainScreen() {

    
      const [produtos, setProdutos] = React.useState([]);
      const [clientes, setClientes] = React.useState([]);
      const [contratosHoje, setContratosHoje] = React.useState([]);
      const [pedidosHoje, setPedidosHoje] = React.useState([]);
      const [loading, setLoading] = React.useState(true);
    

    return (

        <RootScreen>
            <CadastroContainer title="Dashboard">
            </CadastroContainer>


        </RootScreen>
    )


}