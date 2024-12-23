import "./ContratoInput.css";
import ProdutoCombo from "../ProdutoCombo/ProdutoCombo";
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import PeriodoCombo from "../PeriodoCombo/PeriodoCombo";
import { TextField, IconButton } from "@mui/material";
import { AddBox } from "@mui/icons-material";
export default function ContratoInput({
  categorias,
  onSubmitContrato,
  cliente,
  onSelectProduto,
}) {
  const [produto, setProduto] = useState(null);


  const [contrato, setContrato] = useState({
    cliente_id: cliente._id,
    produto: null,
    quantidade: 0,
    data: new Date().toISOString().split("T")[0], // Data padrão para hoje
    periodo: "",
    valor_periodo: 0,
    ativo: true,
  });

  const [produtoComboClearTrigger, setProdutoComboClearTrigger] =
    useState(false);
  useEffect(() => {
    onSelectProduto(produto);
    setContrato({ ...contrato, produto: produto?._id });
  }, [produto]);
  useEffect(() => {
    setContrato({ ...contrato, cliente_id: cliente._id });
  }, [cliente]);
 
  const handleSubmit = async () => {
    console.log("contrato")
    console.log(contrato)
    if (
      !produto ||
      !contrato.quantidade ||
      !contrato.data ||
      !contrato.periodo ||
      !contrato.valor_periodo
    ) {

      return;
    }

    const novoContrato = {
      ...contrato,
      idProvisorio : await invoke("generate_uuid"),
      produto: produto._id,
      quantidade: parseFloat(contrato.quantidade),
    };
    onSubmitContrato(novoContrato);
    setProdutoComboClearTrigger(!produtoComboClearTrigger);
    setContrato({
      cliente_id: cliente._id,
      produto: "",
      quantidade: 0,
      data: new Date().toISOString().split("T")[0],
      periodo: "",
      valor_periodo: "",
      ativo: true,
    });
    
  };
  const handlePeriodoSetData = (data) => {
    console.log("data")
    console.log(data)
    setContrato({
      ...contrato,
      periodo: data.periodo,
      valor_periodo: data.valor_periodo,
    });
  };

  return (
    <>
      <div className="root-contrato-input">
        <div className="contrato-input">
          <div className="contrato-row">
            <ProdutoCombo
              categorias={categorias}
              onSelectProduto={setProduto}
              clearTrigger={produtoComboClearTrigger}
            />
            <TextField
              label="Quantidade"
              type="number"
              size="small"
              value={contrato.quantidade}
              onChange={(e) =>
                setContrato({ ...contrato, quantidade: e.target.value })
              }
            />
          </div>

          <div className="contrato-row">
            <TextField
              label="Data"
              type="date"
              size="small"
              value={contrato.data}
              onChange={(e) =>
                setContrato({ ...contrato, data: e.target.value })
              }
            />

            <PeriodoCombo onSetData={handlePeriodoSetData} data={contrato} />
          </div>
        </div>
        <div className="column-btn">
          <IconButton onClick={handleSubmit}>
   
            <AddBox />
          </IconButton>
        </div>
      </div>
    </>
  );
}
