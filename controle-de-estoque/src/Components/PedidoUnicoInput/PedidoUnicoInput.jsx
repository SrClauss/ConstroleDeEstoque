import "./PedidoUnicoInput.css";
import ProdutoCombo from "../ProdutoCombo/ProdutoCombo";
import React, { useEffect, useState } from "react";
import ValuePil from "../ValuePil/ValuePil";
import {
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { AddBox } from "@mui/icons-material";

export default function PedidoUnicoInput({
  categorias,
  onSubmitPedido,
  cliente,
  onSelectProduto,
}) {
  const [produto, setProduto] = useState(null);
  const [pedido, setPedido] = useState({
    cliente_id: cliente._id,
    produto: "",
    quantidade: 0,
    data: new Date().toISOString().split("T")[0], // Data padrão para hoje
    entrega: new Date().toISOString().split("T")[0], // Entrega padrão para hoje
    executado: false,
  });
  const [open, setOpen] = useState(false);
  const [produtoComboClearTrigger, setProdutoComboClearTrigger] = useState(false);
  useEffect(() => {
    onSelectProduto(produto);
  }, [produto]);
  const handleSubmit = () => {
    if (!produto || !pedido.quantidade || !pedido.data || !pedido.entrega) {
      setOpen(true);
      return;
    }

    const novoPedido = {
      ...pedido,
      produto: produto._id,
      quantidade: parseFloat(pedido.quantidade),
    };
    onSubmitPedido(novoPedido);
    setProdutoComboClearTrigger(!produtoComboClearTrigger);
    setPedido({
      cliente_id: cliente._id,
      produto: "",
      quantidade: 0,
      data: new Date().toISOString().split("T")[0],
      entrega: new Date().toISOString().split("T")[0],
      executado: false,
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="root-pedido-unico">
      <div className="subroot-pedido-unico">
        <div className="inputs-pedido-unico">
          <ProdutoCombo
            categorias={categorias}
            onSelectProduto={setProduto}
            clearTrigger={produtoComboClearTrigger}
          />
          <TextField
            label="Quantidade"
            type="number"
            size="small"
            value={pedido.quantidade}
            onChange={(e) =>
              setPedido({ ...pedido, quantidade: e.target.value })
            }
          />
          <TextField
            label="Data"
            type="date"
            size="small"
            value={pedido.data}
            onChange={(e) => {
              setPedido({
                ...pedido,
                data: e.target.value,
              });
            }}
          />
          <TextField
            label="Entrega"
            type="date"
            size="small"
            value={pedido.entrega}
            onChange={(e) => {
              setPedido({
                ...pedido,
                entrega: e.target.value,
              });
            }}
          />
        </div>
        <div className="infos-pedido-unico">
          <ValuePil
            label="Categoria"
            value={
              produto
                ? categorias.find(
                    (categoria) =>
                      categoria._id.$oid === produto.categoria_id.$oid
                  ).nome
                : ""
            }
          />
          <ValuePil
            label="Preço unitário"
            value={produto ? produto.preco_venda : "00,00"}
          />

          <ValuePil
            label="Preço total"
            value={produto ? produto.preco_venda * pedido.quantidade : "00,00"}
          />
          <ValuePil
            label="Estoque"
            value={produto ? produto.estoque_demanda : "00"}
          />
          <ValuePil
            label="Saldo"
            value={produto ? produto.estoque_demanda - pedido.quantidade : "00"}
          />
        </div>
      </div>
      <div className="button">
        <IconButton onClick={handleSubmit}>
          <AddBox color="primary" />
        </IconButton>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Campos obrigatórios</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, preencha todos os campos obrigatórios.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
