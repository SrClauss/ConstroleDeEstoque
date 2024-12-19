import { MenuItem, TextField } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect } from 'react';
import "./ProdutoCombo.css"

export default function ProdutoCombo({ categorias, onSelectProduto, clearTrigger }) {
  const [produtos, setProdutos] = React.useState([]);
  const [categoria, setCategoria] = React.useState("");
  const [selectedProduto, setSelectedProduto] = React.useState("");
  useEffect(() => {
    setCategoria("");
    setSelectedProduto("");
  }, [clearTrigger]);


  React.useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = categoria
          ? await invoke("filter_produtos_by_category", { categoryId: categoria })
          : await invoke("get_all_produtos");
        setProdutos(response.sort((a, b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
        console.error(error);
      }
    };

    fetchProdutos();
  }, [categoria]);

  const handleProdutoChange = (event) => {
    const produtoId = event.target.value;
    setSelectedProduto(produtoId);
    const produto = produtos.find(produto => produto._id.$oid === produtoId);
    onSelectProduto(produto);
  };

  return (
    <div className='root-produto-combo'>
      <TextField
        sx={{ width: '35%' }}
        select
        size='small'
        label="Categoria"
        value={categoria}
        onChange={(event) => setCategoria(event.target.value)}
      >
        <MenuItem value={""}>Todas</MenuItem>
        {categorias.map((categoria, index) => (
          <MenuItem key={index} value={categoria._id.$oid}>
            {categoria.nome}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Produto"
        size='small'
        fullWidth
        value={selectedProduto}
        onChange={handleProdutoChange}
      >
        <MenuItem value={""}>Selecione um produto</MenuItem>
        {produtos.map((produto, index) => (
          <MenuItem key={index} value={produto._id.$oid}>
            {produto.nome}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
}