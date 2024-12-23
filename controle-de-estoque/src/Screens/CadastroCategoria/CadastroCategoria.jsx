import RootScreen from "../RootScreen/RootScreen";
import CadastroContainer from "../../Components/CadastroContainer/CadastroContainer";
import FormCadastroContainer from "../../Components/CadastroContainer/FormCadastroContainer";
import React, { use, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import AdressCard from "../../Components/AdressCard/AdressCard";
import { Button, TextField } from "@mui/material";
import Modal from "../../Components/Moldal/Modal";
import SearchBar from "../../Components/SearchBar/SearchBar";
import SearchTable from "../../Components/SearchTable/SearchTable";

export default function CadastroCategoria() {
  const [currentCategoria, setCurrentCategoria] = React.useState({
    _id: null,
    nome: "",
    descricao: ""
  });
  const [categorias, setCategorias] = React.useState([]);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [critery, setCritery] = React.useState("");
  const [editMode, setEditMode] = React.useState(false)
  const [stateSelected, setStateSelected] = React.useState(false);

  const handleFindCategoria = async () => {
    invoke("find_categoria_by_substring_name", { nameSubstring: critery })
    .then((response) => {

      const headers = [
        "iD",
        "Nome",
        "Descrição"
      
      ];
      response = response.sort((a, b)=> a.nome.localeCompare(b.nome))
      const rows = response.map((categoria) => {
        const value = Object.values(categoria);
        const id = value[0].$oid;
        const nome = value[1];
        const descricao = value[2];

        return [id, nome, descricao];

      });
      
      setCategorias({ headers, rows, response});
    }).catch((error) => {

      console.error(error);
    });
  }

  useEffect(() => {
    handleFindCategoria();

 
  }, [critery]);
  useEffect(() => {
    if (currentCategoria._id === null){


      setEditMode(false);
    }
    else{
      setEditMode(true);
    }
    
  }, [currentCategoria]);
  const handleCreateCategoria = async () => {
    const fullData = { ...currentCategoria };
    invoke("create_a_categoria", { data: fullData })
      .then((response) => {
        console.log(response);
        setCurrentCategoria({
          nome: "",
          descricao: ""
        });
        handleFindCategoria();
        setStateSelected(!stateSelected)
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleUpdateCategoria = async () => {
    const fullData = { ...currentCategoria };
    invoke("update_categoria", { data: fullData })
      .then((response) => {
        console.log(response);
        setCurrentCategoria({
          nome: "",
          descricao: ""
        });
        handleFindCategoria();
        setStateSelected(!stateSelected)
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <RootScreen>
      <CadastroContainer title={"Categorias"}>
        <SearchBar onSubmitSearch={setCritery} entidade={"Categoria"} />
        <SearchTable data={categorias}  onDataChange={setCurrentCategoria} selectedRow={selectedRow} onSetSelectedRow={setSelectedRow} nullData={{
          _id:null,
          nome: "",
          descricao: ""
        }}/>

        <FormCadastroContainer>
          <div className="simetric-columns">
            <TextField
              size={"small"}
              label="Nome"
              fullWidth
              variant="outlined"
              value={currentCategoria?.nome}
              slotProps={{ inputLabel: { shrink: !!currentCategoria.nome} }}
              onChange={(e) =>
                setCurrentCategoria({ ...currentCategoria, nome: e.target.value })
              }
            />
          </div>

          <div className="simetric-columns">
            <TextField
              size={"small"}
              label="Descrição"
              fullWidth
              variant="outlined"
              value={currentCategoria?.descricao}
              slotProps={{ inputLabel: { shrink: !!currentCategoria.descricao} }}
              onChange={(e) =>
                setCurrentCategoria({ ...currentCategoria, descricao: e.target.value })
              }
            />
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={editMode ? handleUpdateCategoria : handleCreateCategoria}
          >
            {editMode ? "Editar" : "Cadastrar"}
          </Button>
        </FormCadastroContainer>
      </CadastroContainer>
    </RootScreen>
  );
}

