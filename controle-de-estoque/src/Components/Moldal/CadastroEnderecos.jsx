import "./Modal.css";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function CadastroEnderecos({ onSubmitEndereco }) {
    const estados = ["", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

    const [data, setData] = useState({
        nome_endereco: "",
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        estado: "",
        numero: "",
        complemento: "",
        referencia: "",
    });

    const handleCepKeyDown = (e) => {
        const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (controlKeys.includes(e.key)) {
            return;
        }

        if (e.key.match(/[a-z]/i)) {
            e.preventDefault();
        }

        if (e.key.match(/[0-9]/) && e.target.value.length >= 8) {
            e.preventDefault();
        }
    };

    const findAdress = async (cep) => {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        setData(prevData=>({
            ...prevData,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf

        }))
    };
    
    const handleSubmit = (event) => {
        event.preventDefault();
        // Lógica desejada aqui
        onSubmitEndereco(data);
        // Não feche o modal

    };





    return (
        <form className="form-cad" onSubmit={handleSubmit}>
            <div className="title">Cadastro de Endereços</div>
            <div className="two-columns">
                <FormControl variant="outlined" size="small" fullWidth>
                    <TextField
                        id="nome_endereco"
                        label="Nome do Endereço"
                        variant="outlined"
                        size="small"
                        value={data.nome_endereco || ''}
                        onChange={(e) => setData({ ...data, nome_endereco: e.target.value })}
                    />
                </FormControl>
                </div>
            <div className="two-columns">


                <FormControl variant="outlined" size="small"  >
                    <TextField
                        id="cep"
                        label="CEP"
                        variant="outlined"
                        size="small"
                        value={data.cep || ''}
                        onKeyDown={handleCepKeyDown}
                        onBlur={(e) => findAdress(e.target.value)}
                        onChange={(e) => setData({ ...data, cep: e.target.value })}
                    />
                </FormControl>

                <FormControl variant="outlined" size="small" fullWidth>
                    <TextField
                        id="logradouro"
                        label="Rua"
                        variant="outlined"
                        size="small"
                        value={data.logradouro || ''}
                        onChange={(e) => setData({ ...data, logradouro: e.target.value })}
                    />
                </FormControl>
            </div>
            <div className="two-columns">
                <FormControl variant="outlined" size="small" fullWidth>
                    <TextField
                        id="bairro"
                        label="Bairro"
                        variant="outlined"
                        size="small"
                        value={data.bairro || ''}
                        onChange={(e) => setData({ ...data, bairro: e.target.value })}
                    />
                </FormControl>
                <FormControl variant="outlined" size="small" fullWidth>
                    <TextField
                        id="cidade"
                        label="Cidade"
                        variant="outlined"
                        size="small"
                        value={data.cidade || ''}
                        onChange={(e) => setData({ ...data, cidade: e.target.value })}
                    />
                </FormControl>
            </div>
            <div className="two-columns">
                <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel htmlFor="estado">Estado</InputLabel>
                    <Select
                        id="estado"
                        label="Estado"
                        value={data.estado || ''}
                        onChange={(e) => setData({ ...data, estado: e.target.value })}
                    >
                        {estados.map((estado) => (
                            <MenuItem key={estado} value={estado}>
                                {estado}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" fullWidth>
                    <TextField
                        id="numero"
                        label="Número"
                        variant="outlined"
                        size="small"
                        value={data.numero || ''}
                        onChange={(e) => setData({ ...data, numero: e.target.value })}
                    />
                </FormControl>
                <FormControl variant="outlined" size="small" fullWidth>
                    <TextField
                        id="complemento"
                        label="Complemento"
                        variant="outlined"
                        size="small"
                        value={data.complemento || ''}
                        onChange={(e) => setData({ ...data, complemento: e.target.value })}
                    />
                </FormControl>
            </div>
            <div className="two-columns">
                <FormControl variant="outlined" size="small" fullWidth>
                    <TextField
                        id="referencia"
                        label="Referência"
                        variant="outlined"
                        size="small"
                        value={data.referencia || ''}
                        onChange={(e) => setData({ ...data, referencia: e.target.value })}
                    />
                </FormControl>

            </div>
            <Button fullWidth onClick={(e)=>{
                if (data.nome_endereco, data.cep, data.logradouro, data.bairro, data.cidade, data.estado, data.numero){
                onSubmitEndereco(data)
                }
                else{
                    alert("Preencha todos os campos")
                }



                }} variant="contained" color="primary">
                Enviar
            </Button>
        </form>
    );
}