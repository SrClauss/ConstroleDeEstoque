import RootScreen from "../RootScreen/RootScreen";
import CadastroContainer from "../../Components/CadastroContainer/CadastroContainer";
import React, { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import SearchBar from "../../Components/SearchBar/SearchBar";
import SearchTable from "../../Components/SearchTable/SearchTable";
import "./PedidoUnico.css";
import ContainerCliente from "../../Components/ContainerCliente/ContainerCliente";
import PedidoUnicoInput from "../../Components/PedidoUnicoInput/PedidoUnicoInput";
import TablePedidos from "../../Components/TablePedidos/TablePedidos";

export default function PedidoUnico() {
  const [currentCliente, setCurrentCliente] = React.useState({
    _id: null,
    nome: "",
    email: "",
    telefone: "",
    cpf_cnpj: "",
    data_nascimento: "",
  });
  const [pedidos, setPedidos] = React.useState([]);
  const [produtos, setProdutos] = React.useState([]); //criei este estado para armazenar os produtos e passar a lista ded nomes dos produtos para tablepedidos
  const [categorias, setCategorias] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [critery, setCritery] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState(null);
  const handleFindCliente = async () => {
    invoke("find_cliente_by_substring_name", { nameSubstring: critery })
      .then((response) => {
        const headers = ["iD", "Nome", "cpf_cnpj"];
        response = response.sort((a, b) => a.nome.localeCompare(b.nome));
        const rows = response.map((cliente) => {
          const value = Object.values(cliente);
          const id = value[0].$oid;
          const nome = value[1];
          const cpf_cnpj = value[4];

          return [id, nome, cpf_cnpj];
        });

        setClientes({ headers, rows, response });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    handleFindCliente();
  }, [critery]);
  useEffect(() => {
    invoke("get_categorias")
      .then((response) => {
        setCategorias(response);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleCadastraPedido = async (pedido) => {
    invoke("create_a_pedido", { data: pedido })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <RootScreen>
      <CadastroContainer title={"Pedido Unico"}>
        <SearchBar onSubmitSearch={setCritery} entidade={"Cliente"} />
        <SearchTable
          data={clientes}
          onDataChange={setCurrentCliente}
          selectedRow={selectedRow}
          onSetSelectedRow={setSelectedRow}
          nullData={{
            _id: null,
            nome: "",
            email: "",
            telefone: "",
            cpf_cnpj: "",
            data_nascimento: "",
            enderecos: [],
          }}
        />

        <ContainerCliente cliente={currentCliente.nome}>
          {currentCliente._id && (
            <PedidoUnicoInput
              categorias={categorias}
              cliente={currentCliente}
              onSubmitPedido={(e) => {
                setPedidos([...pedidos, e]);
              }}
              onSelectProduto={(e) => {
                setProdutos(
                  [...produtos, e].filter((produto) => produto !== null)
                );
              }}
            />
          )}
          <TablePedidos
            pedidos={pedidos}
            onDeletePedido={(pedido) => {
              setPedidos(pedidos.filter((p) => p !== pedido));
            }}
            onSubmitAllPedidos={(pedidos) => {
              pedidos.forEach((pedido) => {
                handleCadastraPedido(pedido);
              });
              setPedidos([]);
            }}
            produtos={produtos}
          />
        </ContainerCliente>
      </CadastroContainer>
    </RootScreen>
  );
}
