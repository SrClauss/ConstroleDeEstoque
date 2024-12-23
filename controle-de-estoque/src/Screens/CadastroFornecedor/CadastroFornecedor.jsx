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
export default function CadastroFornecedor() {
    const [currentFornecedor, setCurrentFornecedor] = React.useState({

        _id: null,
        nome: "",
        cpf_cnpj: "",
        email: "",
        telefone: "",
        data_criacao: "",
        enderecos: [],
    });
    const [currentEnderecos, setCurrentEnderecos] = React.useState([]);
    const [fornecedores, setFornecedores] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const [critery, setCritery] = React.useState("");
    const [stateSelected, setStateSelected] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState(null);
    const handleFindFornecedor = async () => {
        invoke("find_fornecedor_by_substring_name", { nameSubstring: critery })
            .then((response) => {
                const headers = ["iD", "Nome", "cpf_cnpj"];
                response = response.sort((a, b) => a.nome.localeCompare(b.nome));
                const rows = response.map((fornecedor) => {
                    const value = Object.values(fornecedor);
                    const id = value[0].$oid;
                    const nome = value[1];
                    const cpf_cnpj = value[2];
                    return [id, nome, cpf_cnpj];
                });
                setFornecedores({ headers, rows, response });
            })
            .catch((error) => {
                console.error(error);
            });
    };
    useEffect(() => {
        handleFindFornecedor();
    }, [critery]);
    useEffect(() => {
        if (currentFornecedor._id === null) {
           
            setEditMode(false);
        } else {
            setEditMode(true);
        }
        if (currentFornecedor) {
            setCurrentEnderecos(currentFornecedor.enderecos ? currentFornecedor.enderecos : []);
        }
    }, [currentFornecedor]);
    const handleCreateFornecedor = async () => {
        const fullData = { ...currentFornecedor, enderecos: currentEnderecos };
        console.log(fullData);
        
        invoke("create_a_fornecedor", { data: fullData })

            .then((response) => {
                
                setCurrentFornecedor({
                    nome: "",
                    cpf_cnpj: "",
                    email: "",
                    telefone: "",
                    data_criacao: "",
                });
                setCurrentEnderecos([]);
                handleFindFornecedor();
                setStateSelected(!stateSelected);
            })
            .catch((error) => {
                console.error(error);
            });

    }
    const handleUpdateFornecedor = async () => {
        const fullData = { ...currentFornecedor, enderecos: currentEnderecos };
        invoke("update_fornecedor", { data: fullData })
            .then((response) => {
                console.log(response);
                setCurrentFornecedor({
                    nome: "",
                    cpf_cnpj: "",
                    email: "",
                    telefone: "",
                    data_criacao: "",
                });
                setCurrentEnderecos([]);
                handleFindFornecedor();
                setStateSelected(!stateSelected);
            })
            .catch((error) => {
                console.error(error);
            });
    }
    return (
        <RootScreen>
            <CadastroContainer title={"Fornecedores"}>
                <SearchBar onSubmitSearch={setCritery} entidade={"Fornecedor"}/>
                <SearchTable
                    data={fornecedores}
                    onDataChange={setCurrentFornecedor}
                    selectedRow={selectedRow}
                    onSetSelectedRow={setSelectedRow}
                    nullData={{
                        _id: null,
                        nome: "",
                        cpf_cnpj: "",
                        email: "",
                        telefone: "",
                        enderecos: [],
                    }}
                />
                <FormCadastroContainer>
                    <div className="simetric-columns">
                        <TextField
                            size={"small"}
                            label="Nome"
                            fullWidth
                            variant="outlined"
                            value={currentFornecedor?.nome}
                            slotProps={{ inputLabel: { shrink: !!currentFornecedor.nome } }}
                            onChange={(e) =>
                                setCurrentFornecedor({ ...currentFornecedor, nome: e.target.value })
                            }
                        />
                    </div>
                    <div className="simetric-columns">
                        <TextField
                            size={"small"}
                            label="Email"
                            value={currentFornecedor?.email}
                            fullWidth
                            variant="outlined"
                            slotProps={{ inputLabel: { shrink: !!currentFornecedor.email } }}
                            onChange={(e) =>
                                setCurrentFornecedor({ ...currentFornecedor, email: e.target.value })
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
                            value={currentFornecedor?.telefone}
                            slotProps={{ inputLabel: { shrink: !!currentFornecedor.telefone } }}
                            onChange={(e) => {
                                if (e.target.value.length <= 11) {
                                    setCurrentFornecedor({ ...currentFornecedor, telefone: e.target.value });
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
                                setCurrentFornecedor({
                                    ...currentFornecedor,
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
                                setCurrentFornecedor({
                                    ...currentFornecedor,
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
                            value={currentFornecedor?.cpf_cnpj}
                            slotProps={{ inputLabel: { shrink: !!currentFornecedor.cpf_cnpj } }}
                            onChange={(e) => {
                                if (e.target.value.length <= 14) {
                                    setCurrentFornecedor({ ...currentFornecedor, cpf_cnpj: e.target.value });
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
                                setCurrentFornecedor({
                                    ...currentFornecedor,
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
                                setCurrentFornecedor({
                                    ...currentFornecedor,
                                    cpf_cnpj: maskCpfCnpj(e.target.value),
                                });
                            }}
                        />

                        <TextField
                            size={"small"}
                            label="Data de Criação"
                            fullWidth
                            type="date"
                            variant="outlined"
                            value={currentFornecedor?.data_criacao}
                            slotProps={{ inputLabel: { shrink: true } }}
                            onChange={(e) =>
                                setCurrentFornecedor({ ...currentFornecedor, data_criacao: e.target.value })
                            }
                        />

                        

                        <TextField
                        
                                      size={"small"}
                                      label="Data de Cadastro"
                                      fullWidth
                                      type="data"
                                      value={currentFornecedor?.data_nascimento}
                                      slotProps={{ inputLabel: { shrink: true} }}
                                      variant="outlined"
                                      onChange={(e) =>
                                        setcurrentFornecedor({
                                          ...currentFornecedor,
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
                        onClick={editMode ? handleUpdateFornecedor : handleCreateFornecedor}

                    >
                        {editMode ? "Editar" : "Cadastrar"}
                    </Button>

                </FormCadastroContainer>
            </CadastroContainer>
        </RootScreen>
    );

}


