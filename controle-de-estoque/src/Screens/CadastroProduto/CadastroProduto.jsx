import RootScreen from "../RootScreen/RootScreen";
import CadastroContainer from "../../Components/CadastroContainer/CadastroContainer";
import FormCadastroContainer from "../../Components/CadastroContainer/FormCadastroContainer";
import React, { use, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, TableCell, TextField } from "@mui/material";
import { MenuItem } from "@mui/material";
import SearchBar from "../../Components/SearchBar/SearchBar";
import SearchTable from "../../Components/SearchTable/SearchTable";
export default function CadastroProduto() {
  const [categorias, setCategorias] = React.useState([]);
  const [produtos, setProdutos] = React.useState([]);
  const [currentProduto, setCurrentProduto] = React.useState({});
  const [criterio, setCriterio] = React.useState("");
  const [editMode, setEditMode] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const getCategorias = async () => {
    const categorias = await invoke("get_categorias");
    return categorias;
  };

  const handleChangeProduto = (produto) => {
    console.log({ ...produto, categoria_id: produto.categoria_id.$oid });
    if (produto._id == null) {
      setEditMode(false);
    } else {
      setEditMode(true);
    }
    setCurrentProduto({ ...produto, categoria_id: produto.categoria_id.$oid });
  };
  const handleFindProdutos = async () => {
    getCategorias()
      .then((categorias) => {
        setCategorias(
          categorias.map((categoria) => {
            return { value: categoria._id.$oid, label: categoria.nome };
          })
        );
        invoke("find_produto_by_substring_name", { nameSubstring: criterio })
          .then((response) => {
            const headers = [
              "Nome",
              "Categoria",
              "Compra",
              "Venda",
              "Unidade",
              "Estoque",
            ];
            response = response.sort((a, b) => a.nome.localeCompare(b.nome));

            const rows = response.map((produto) => {
              const value = Object.values(produto);
              const nome = value[1];
              const categoria = categorias.find(
                (categoria) => categoria._id.$oid == value[2].$oid
              ).nome;
              const compra = parseFloat(value[3]).toFixed(2);
              const venda = parseFloat(value[4]).toFixed(2);
              const unidade = value[5];
              const estoque = value[6];
              return [nome, categoria, compra, venda, unidade, estoque];
            });
            setProdutos({ headers, rows, response });

            setProdutos({ headers, rows, response });
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    handleFindProdutos();
  }, [criterio]);
  const handleSaveProduto = async () => {
    const adaptedProduto = {
      ...currentProduto,
      categoria_id: { $oid: currentProduto.categoria_id },
      preco_compra: parseFloat(currentProduto.preco_compra).toFixed(2),
      preco_venda: parseFloat(currentProduto.preco_venda).toFixed(2),
    };

    invoke("create_a_produto", { data: adaptedProduto })
      .then((response) => {
        handleFindProdutos();
        setCurrentProduto({
          _id: null,
          nome: "",
          categoria_id: "",
          preco_compra: "",
          preco_venda: "",
          unidade: "",
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleEditProduto = async () => {
    const adaptedProduto = {
      ...currentProduto,
      categoria_id: { $oid: currentProduto.categoria_id },
      preco_compra: parseFloat(currentProduto.preco_compra).toFixed(2),
      preco_venda: parseFloat(currentProduto.preco_venda).toFixed(2),
    };

    invoke("edit_produto", { data: adaptedProduto })
      .then((response) => {
        console.log(response);

        handleFindProdutos();
        setCurrentProduto({
          _id: null,
          nome: "",
          categoria_id: "",
          preco_compra: "",
          preco_venda: "",
          unidade: "",
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <>
      <RootScreen>
        <CadastroContainer title="Produtos">
          <SearchBar onSubmitSearch={setCriterio} entidade={"produto"} />
          <SearchTable
            data={produtos}
            onSetSelectedRow={setSelectedRow}
            selectedRow={selectedRow}
            onDataChange={handleChangeProduto}
            nullData={{
              _id: null,
              nome: "",
              categoria_id: "",

              preco_compra: "",
              preco_venda: "",
              unidade: "",
            }}
          />
          <FormCadastroContainer>
            <div className="simetric-columns">
              <TextField
                id="nome"
                size="small"
                label="Nome"
                variant="outlined"
                value={currentProduto?.nome}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: !!currentProduto?.nome } }}
                onChange={(e) =>
                  setCurrentProduto({ ...currentProduto, nome: e.target.value })
                }
              />
              <TextField
                id="categoria"
                label="Categoria"
                size="small"
                variant="outlined"
                select
                fullWidth
                required
                defaultValue={""}
                onChange={(e) => {
                  setCurrentProduto({
                    ...currentProduto,
                    categoria_id: e.target.value,
                  });
                }}
                slotProps={{
                  inputLabel: { shrink: !!currentProduto?.categoria_id },



                }}
                value={String(
                  currentProduto?.categoria_id
                    ? currentProduto.categoria_id
                    : ""
                )}
              >
                <MenuItem value="">Selecione uma categoria</MenuItem>
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className="simetric-columns">
              <TextField
                id="preco_compra"
                size="small"
                type="number"
                label="Preço de Compra"
                variant="outlined"
                value={currentProduto?.preco_compra}
                fullWidth
                required
                slotProps={{
                  inputLabel: { shrink: !!currentProduto?.preco_compra },
                  input:{
                    startAdornment: !!currentProduto?.preco_compra ?<span style={{paddingRight: "5px"}}>{"R$"}</span>: null
                  }
                }}
                onChange={(e) =>
                  setCurrentProduto({
                    ...currentProduto,
                    preco_compra: e.target.value,
                  })
                }
              />
              <TextField
                id="preco_venda"
                size="small"
                label="Preço de Venda"
                type="number"
                variant="outlined"
                value={currentProduto?.preco_venda}
                fullWidth
                required
                slotProps={{
                  inputLabel: { shrink: !!currentProduto?.preco_venda },

                  input:{

                    startAdornment: !!currentProduto?.preco_venda ?<span style={{paddingRight: "5px"}}>{"R$"}</span>: null

                  }
                }}
                onChange={(e) =>
                  setCurrentProduto({
                    ...currentProduto,
                    preco_venda: e.target.value,
                  })
                }
              />

              <TextField
                id="unidade"
                size="small"
                label="Unidade"
                variant="outlined"
                value={currentProduto?.unidade}
                fullWidth
                required
                onChange={(e) =>
                  setCurrentProduto({
                    ...currentProduto,
                    unidade: e.target.value,
                  })
                }
                slotProps={{
                  inputLabel: { shrink: !!currentProduto?.unidade },
                }}
              />
            </div>

            <Button
              onClick={editMode ? handleEditProduto : handleSaveProduto}
              variant="contained"
            >
              {editMode ? "Editar" : "Salvar"}
            </Button>
          </FormCadastroContainer>
        </CadastroContainer>
      </RootScreen>
    </>
  );
}
