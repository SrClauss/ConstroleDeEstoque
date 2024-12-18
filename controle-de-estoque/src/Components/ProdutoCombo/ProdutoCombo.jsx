import { MenuItem, TextField } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React from 'react';
import "./ProdutoCombo.css"



export default function ProdutoCombo({ categorias, onSelectProduto}) {
    const [produtos, setProdutos] = React.useState([]);
    const [categoria, setCategoria] = React.useState("");
    
    React.useEffect(() => {
    
        if (categoria === "" || categoria === null){
            invoke("get_all_produtos").then((response) => {
                setProdutos(response.sort((a, b) => a.nome.localeCompare(b.nome)));
            }).catch((error) => {
                console.error(error);
            });
        }

        else{
            invoke("filter_produtos_by_category", {categoryId: categoria}).then((response) => {
                
                console.log(response.sort((a, b) => a.nome.localeCompare(b.nome)));
                setProdutos(response);
            }).catch((error) => {
                console.error(error);
            });
         }
        }, [categoria]);



    
    return(
        <div  className='root-produto-combo'>
            <TextField
                sx={{width: '35%'}}
                select
                size='small'
                label="Categoria"
                onChange={(event) => {
                    setCategoria(event.target.value);


                }}
                             
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
                onChange={(event) => {
                    const selectedProduto = produtos.find(produto => produto._id.$oid === event.target.value);
                    onSelectProduto(selectedProduto);
                    
                }}
            >
                <MenuItem value={""}>Selecione um produto</MenuItem>
                {produtos.map((produto, index) => (

                    <MenuItem key={index} value={produto._id.$oid}>
                        {produto.nome}
                    </MenuItem>
                ))}
            </TextField>

        </div>


    )

}