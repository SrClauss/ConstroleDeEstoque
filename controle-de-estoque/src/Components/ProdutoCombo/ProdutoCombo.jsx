import { MenuItem, TextField } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React from 'react';



export default function ProdutoCombo({ categorias, onSelectProduto}) {
    const [produtos, setProdutos] = React.useState([]);
    const [categoria, setCategoria] = React.useState("");

    React.useEffect(() => {
        if (categoria === "" || categoria === null){
            invoke("get_all_produtos").then((response) => {
                setProdutos(response);
            }).catch((error) => {
                console.error(error);
            });
        }

        else{
            invoke("get_produtos_by_categoria", {categoria: categoria}).then((response) => {
                
                setProdutos(response);
            }).catch((error) => {
                console.error(error);
            });
         }
        }, [categoria]);



    
    return(
        <div>
            <TextField
                select
                label="Categoria"
                fullWidth
                onSelect={(event) => {
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
                fullWidth
                onSelect={(event) => {
                    onSelectProduto(event.target.value);
                }}
            >

                {produtos.map((produto, index) => (

                    <MenuItem key={index} value={produto._id.$oid}>
                        {produto.nome}
                    </MenuItem>
                ))}
            </TextField>

        </div>


    )

}