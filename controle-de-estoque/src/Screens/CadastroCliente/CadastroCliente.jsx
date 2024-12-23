import RootScreen from "../RootScreen/RootScreen";
import CadastroContainer from "../../Components/CadastroContainer/CadastroContainer";
import FormCadastroContainer from "../../Components/CadastroContainer/FormCadastroContainer";
import React, { use, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import AdressCard from "../../Components/AdressCard/AdressCard";
import { Button, TextField } from "@mui/material";
import Modal from "../../Components/Moldal/Modal";
import CadastroEnderecos from "../../Components/Moldal/CadastroEnderecos";
import SearchBar from "../../Components/SearchBar/SearchBar";
import SearchTable from "../../Components/SearchTable/SearchTable";
import { maskCpfCnpj, maskTelefone } from "../../utils";

export default function CadastroCliente() {
  const [currentCliente, setCurrentCliente] = React.useState({
    _id: null,
    nome: "",
    email: "",
    telefone: "",
    cpf_cnpj: "",
    data_nascimento: "",
  });
  const [currentEnderecos, setCurrentEnderecos] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [critery, setCritery] = React.useState("");
  const [dateTypeType, setDateTypeType] = React.useState("text");
  const [editMode, setEditMode] = React.useState(false)
  const [selectedRow, setSelectedRow] = React.useState(null);

  const handleFindCliente = async () => {
    invoke("find_cliente_by_substring_name", { nameSubstring: critery })
    .then((response) => {

      const headers = [
        "iD",
        "Nome",
        "cpf_cnpj"
      
      ];
      response = response.sort((a, b)=> a.nome.localeCompare(b.nome))
      const rows = response.map((cliente) => {
        const value = Object.values(cliente);
        const id = value[0].$oid;
        const nome = value[1];
        const cpf_cnpj = value[4];

        return [id, nome, cpf_cnpj];

      });
      
      setClientes({ headers, rows, response});
    }).catch((error) => {

      console.error(error);
    });
  }

  useEffect(() => {
    handleFindCliente();

 
  }, [critery]);
  useEffect(() => {
    if (currentCliente._id === null ){

      setEditMode(false);
    }
    else{
      setEditMode(true);
    }
    if (currentCliente) {
      setCurrentEnderecos(currentCliente.enderecos ? currentCliente.enderecos : []);
    }
    
  }, [currentCliente]);
  const handleCreateCliente = async () => {
    const fullData = { ...currentCliente, enderecos: currentEnderecos };
    invoke("create_a_cliente", { data: fullData })
      .then((response) => {
        console.log(response);
        setCurrentCliente({
          nome: "",
          email: "",
          telefone: "",
          cpf_cnpj: "",
          data_nascimento: "",
        });
        setCurrentEnderecos([]);
        handleFindCliente();
        setStateSelected(!stateSelected)
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleUpdateCliente = async () => {
    const fullData = { ...currentCliente, enderecos: currentEnderecos };
    invoke("update_cliente", { data: fullData })
      .then((response) => {
        console.log(response);
        setCurrentCliente({
          nome: "",
          email: "",
          telefone: "",
          cpf_cnpj: "",
          data_nascimento: "",
        });
        setCurrentEnderecos([]);
        handleFindCliente();
        setStateSelected(!stateSelected)
      })
      .catch((error) => {
        console.error(error);
      });
  }
  return (
    <RootScreen>
      <CadastroContainer title={"Clientes"}>
        <SearchBar onSubmitSearch={setCritery} entidade={"Cliente"}/>
        <SearchTable data={clientes} onDataChange={setCurrentCliente} selectedRow={selectedRow} onSetSelectedRow={setSelectedRow} nullData={{
        _id: null,
        nome: "",
        email: "",
        telefone: "",
        cpf_cnpj: "",
        data_nascimento: "",
        enderecos: [],
      }}/>

        <FormCadastroContainer>
          <div className="simetric-columns">
            <TextField
              size={"small"}
              label="Nome"
              fullWidth
              variant="outlined"
              value={currentCliente?.nome}
              slotProps={{ inputLabel: { shrink: !!currentCliente.nome} }}
              onChange={(e) =>setCurrentCliente({ ...currentCliente, nome: e.target.value })}
            />
          </div>

          <div className="simetric-columns">
            <TextField
              size={"small"}
              label="Email"
              value={currentCliente?.email}
              fullWidth
              variant="outlined"
              slotProps={{ inputLabel: { shrink: !!currentCliente.email} }} 
              onChange={(e) =>
                setCurrentCliente({ ...currentCliente, email: e.target.value })
              }
              onBlur={(e) => {
                if (
                  !e.target.value.match(
                    /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i
                  ) &&
                  e.target.value.length != ""
                ) {
                  alert("Email inválido");
                  setTimeout(() => {
                    e.target.focus();
                  }, 100);
                }
              }}
              type="email"
            />
            <TextField
              size={"small"}
              label="Telefone"
              fullWidth
              type="tel"
              variant="outlined"
              value={currentCliente?.telefone}
              slotProps={{ inputLabel: { shrink: !!currentCliente.telefone} }} // APENAS PARA TESTE DE C
              onChange={(e) => {
                if (e.target.value.length <= 11) {
                  setCurrentCliente({ ...currentCliente, telefone: e.target.value });
                }
              }}
              onKeyDown={(e) => {
                if (
                  !e.key.match(/[0-9]/) &&
                  e.key !== "Backspace" &&
                  e.key !== "Tab" &&
                  e.key !== "Shift" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight" &&
                  e.key !== "ArrowUp" &&
                  e.key !== "ArrowDown" &&
                  e.key !== "Delete"
                ) {
                  e.preventDefault();
                }
              }}
              onFocus={(e) => {
                setCurrentCliente({
                  ...currentCliente,
                  telefone: e.target.value.replace(/\D/g, ""),
                });
              }}
              onBlur={(e) => {
                if (
                  e.target.value.length != 10 &&
                  e.target.value.length != 11 &&
                  e.target.value.length != 0
                ) {
                  alert("Telefone inválido");
                  setTimeout(() => {
                    e.target.focus();
                  }, 100);
                }
                setCurrentCliente({
                  ...currentCliente,
                  telefone: maskTelefone(e.target.value),
                });
              }}
            />
          </div>

          <div className="simetric-columns">
            <TextField
              size={"small"}
              label="CPF/CNPJ"
              fullWidth
              variant="outlined"
              value={currentCliente?.cpf_cnpj}
              slotProps={{ inputLabel: { shrink: !!currentCliente.cpf_cnpj} }} // APENAS PARA TESTE DE C
              onChange={(e) => {
                if (e.target.value.length <= 14) {
                  setCurrentCliente({ ...currentCliente, cpf_cnpj: e.target.value });
                }
              }}
              onKeyDown={(e) => {
                if (
                  !e.key.match(/[0-9]/) &&
                  e.key !== "Backspace" &&
                  e.key !== "Tab" &&
                  e.key !== "Shift" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight" &&
                  e.key !== "ArrowUp" &&
                  e.key !== "ArrowDown" &&
                  e.key !== "Delete"
                ) {
                  e.preventDefault();
                }
              }}
              onFocus={(e) => {
                setCurrentCliente({
                  ...currentCliente,
                  cpf_cnpj: e.target.value.replace(/\D/g, ""),
                });
              }}
              onBlur={(e) => {
                if (
                  e.target.value.length != 11 &&
                  e.target.value.length != 14 &&
                  e.target.value.length != 0
                ) {
                  alert("CPF/CNPJ inválido");
                  setTimeout(() => {
                    e.target.focus();
                  }, 100);
                }
                setCurrentCliente({
                  ...currentCliente,
                  cpf_cnpj: maskCpfCnpj(e.target.value),
                });
              }}
            />
            <TextField

              size={"small"}
              label="Data de Nascimento"
              fullWidth
              type={dateTypeType}
              value={currentCliente?.data_nascimento}
              slotProps={{ inputLabel: { shrink: true} }}
              variant="outlined"
              onChange={(e) =>
                setCurrentCliente({
                  ...currentCliente,
                  data_nascimento: e.target.value,
                })
              }
              onFocus={
                (e) => {
                  e.target.type = "date";
                }
              }
              onBlur={
                //se o campo estiver vazio, ele volta a ser um campo de texto
                (e) => {
                  if (e.target.value === "") {
                    e.target.type = "text";
                  }
                }


              }
            />
          </div>

          <div>
            <AdressCard
              adresses={currentEnderecos}
              onAddAdress={(_) => setShowModal(true)}
              onDeleteAdress={(index) => {
                setCurrentEnderecos(
                  currentEnderecos.filter((_, i) => i !== index)
                );
              }}

            />
            <Modal
              show={showModal}
              onClose={() => setShowModal(false)}
              component={
                <CadastroEnderecos
                  onSubmitEndereco={(e) => {
                    setShowModal(false);
                    setCurrentEnderecos([...currentEnderecos, e]);
                  }}
                />
              }
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={editMode ? handleUpdateCliente : handleCreateCliente}
          > 
            {editMode ? "Editar" : "Cadastrar"}
          </Button>
        </FormCadastroContainer>
      </CadastroContainer>
    </RootScreen>
  );
}


/*


pub struct Cliente {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub nome: String,
    pub email: String,
    pub telefone: String,
    pub cpf_cnpj: String,
    pub data_nascimento: String,
    pub enderecos: Vec<Endereco>,
}



*/