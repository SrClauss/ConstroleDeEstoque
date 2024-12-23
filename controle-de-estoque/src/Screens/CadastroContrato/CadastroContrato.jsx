import RootScreen from "../RootScreen/RootScreen";
import CadastroContainer from "../../Components/CadastroContainer/CadastroContainer";
import React, { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import SearchBar from "../../Components/SearchBar/SearchBar";
import SearchTable from "../../Components/SearchTable/SearchTable";
import "./CadastroContrato.css";
import ContainerCliente from "../../Components/ContainerCliente/ContainerCliente";
import ContratoInput from "../../Components/ContratoInput/ContratoInput";
import TableContrato from "../../Components/TableContrato/TableConstrato";
import TableContratosAntigos from "../../Components/TableContratosAntigos/TableContratosAntigos";
import ErrorDialog from "../../Components/ErrorDialog/ErrorDialog";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
} from "@mui/material";

export default function CadastroContrato() {
  const [currentCliente, setCurrentCliente] = React.useState({
    _id: null,
    nome: "",
    email: "",
    telefone: "",
    cpf_cnpj: "",
    data_nascimento: "",
  });

  const [contratos, setContratos] = React.useState([]);
  const [produtos, setProdutos] = React.useState([]); //criei este estado para armazenar os produtos e passar a lista ded nomes dos produtos para tablepedidos
  const [categorias, setCategorias] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [critery, setCritery] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [dialogProps, setDialogProps] = React.useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [tabvalue, setTabValue] = React.useState(0);
  const [contratosAntigos, setContratosAntigos] = React.useState([]);
  const handleSetCliente = (cliente) => {
    if (contratos.length > 0) {
      setDialogProps({
        open: true,
        title: "Atenção",
        message: "Deseja descartar os contratos já cadastrados?",
        onConfirm: () => {
          setCurrentCliente(cliente);
          setContratos([]);
          setDialogProps({ ...dialogProps, open: false });
        },
        onCancel: () => {
          setDialogProps({ ...dialogProps, open: false });
        },
      });
    } else {
      setCurrentCliente(cliente);
    }

    invoke("get_all_contratos_by_cliente", {
      clienteId: cliente._id.$oid,
    }).then((response) => {
      setContratosAntigos(response);
    }).catch((error) => {
      console.error("Erro:", error);
    });
  };
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
    if (contratos.length === 0 && currentCliente._id !== null) {
      handleSetCliente(currentCliente);
    }
  }, [contratos]);
  useEffect(() => {
    handleFindCliente();
  }, [critery]);
  useEffect(() => {}, [currentCliente]);
  useEffect(() => {
    invoke("get_categorias")
      .then((response) => {
        setCategorias(response);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const handleDeleteContrato = (idProvisorio) => {
    setContratos(
      contratos.filter((contrato) => contrato.idProvisorio !== idProvisorio)
    );
  };

  const handleSubmitAllContratos = async () => {
    try {
      // Cria array de promises
      const promises = contratos.map((contrato) =>
        invoke("generate_object_id").then((objectId) => ({
          ...contrato,
          _id: objectId,
          cliente_id: contrato.cliente_id.$oid,
          produto_id: contrato.produto.$oid,
          valor_periodo: parseInt(contrato.valor_periodo),
        }))
      );

      // Aguarda todas as promises
      const contratosAdaptados = await Promise.all(promises);

      // Envia para criação atômica
      const response = await invoke("atomic_create_contracts", {
        data: contratosAdaptados,
      });

      setContratos([]);

      console.log("Sucesso:", response);
    } catch (error) {
      console.error("Erro:", error);
    }
  };
  const handleDeleteContratoAntigo = (id) => {
    setDialogProps({
      open: true,
      title: "Atenção",
      message: "Deseja realmente excluir este contrato?",
      onConfirm: () => {

        invoke("delete_contrato", { contratoId: id.$oid })
          .then(() => {
            handleSetCliente(currentCliente);
            setDialogProps({ ...dialogProps, open: false });
          })
          .catch((error) => {
            console.error("Erro:", error);
          });
        },
      onCancel: () => {

        setDialogProps({ ...dialogProps, open: false });

      },
    });
  };

  const handleToggleStateSelected = (id) => {
    invoke("toggle_contrato_status", { contratoId: id.$oid })
      .then(() => {
        handleSetCliente(currentCliente);
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  };

  return (
    <RootScreen>
      <CadastroContainer title={"Contrato"}>
        <SearchBar onSubmitSearch={setCritery} entidade={"Cliente"} />
        <SearchTable
          data={clientes}
          onDataChange={handleSetCliente}
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
        <ErrorDialog {...dialogProps} />
        <ContainerCliente cliente={currentCliente.nome}>
          {currentCliente.nome !== "" ? (
            <>
              <Tabs
                centered
                value={tabvalue}
                onChange={(e, newValue) => setTabValue(newValue)}
              >
                <Tab label="Novos Contratos" />
                <Tab label="Contratos Cadastrados" />
              </Tabs>
              <TabPanel value={tabvalue} index={0}>
                <ContratoInput
                  categorias={categorias}
                  onSubmitContrato={(e) =>
                    setContratos([...contratos, e].filter((c) => c !== null))
                  }
                  cliente={currentCliente}
                  onSelectProduto={(e) =>
                    setProdutos([...produtos, e].filter((p) => p !== null))
                  }
                />
                <TableContrato
                  contratos={contratos}
                  produtos={produtos}
                  onDeleteContrato={handleDeleteContrato}
                  onSubmitAllContratos={handleSubmitAllContratos}
                />
              </TabPanel>

              <TabPanel value={tabvalue} index={1}>
                <TableContratosAntigos
                  contratos={contratosAntigos}
                  onDeleteContrato={handleDeleteContratoAntigo}
                  onToggleContrato={handleToggleStateSelected}
               
                />
              </TabPanel>
            </>
          ) : (
            <div className="nenhum-cliente">Nenhum Cliente Selecionado</div>
          )}

        
        </ContainerCliente>
      </CadastroContainer>
    </RootScreen>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </div>
  );
}
