import "./PedidoUnicoInput.css";
import ProdutoCombo from "../ProdutoCombo/ProdutoCombo";
import React from "react";
import { TextField } from "@mui/material";
import { IconButton } from "@mui/material";
import { AddBox } from "@mui/icons-material";
export default function PedidoUnicoInput({
  categorias,
  onSubmitPedido,
  cliente,
}) {
  const [produto, setProduto] = React.useState(null);
  const [quantidade, setQuantidade] = React.useState(0);
  const [pedido, setPedido] = React.useState(null);

  React.useEffect(() => {
    setPedido({ ...pedido, cliente_id: cliente._id.$oid });
  }, [cliente]);
  React.useEffect(() => {
    console.log(pedido);
  }, [pedido]);

  React.useEffect(() => {
    if (produto) {
      setPedido({
        ...pedido,
        produto: produto._id.$oid,
      });
    }
  }, [produto]);
  React.useEffect(() => {
    if (quantidade) {
      setPedido({
        ...pedido,
        quantidade: parseFloat(quantidade),
      });
    }
  }, [quantidade]);
  return (
    <div className="root-pedido-unico">
      <div className="subroot-pedido-unico">
        <div className="inputs-pedido-unico">
          <ProdutoCombo categorias={categorias} onSelectProduto={setProduto} />
          <TextField
            label="Quantidade"
            type="number"
            size="small"
            onChange={(e) => setQuantidade(e.target.value)}
          />
          <TextField
            label="Data"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
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
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => {
              setPedido({
                ...pedido,
                entrega: e.target.value,
              });
            }}
          />
        </div>

        <div className="infos-pedido-unico">
          <div className="info-pedido-unico">
            <div>Categoria:</div>
            <div>
              {produto
                ? categorias.find(
                    (categoria) =>
                      categoria._id.$oid === produto.categoria_id.$oid
                  ).nome
                : ""}
            </div>
          </div>
          <div className="info-pedido-unico">
            <div>Preço unitário:</div>
            <div>R$ {produto ? produto.preco_venda : "00,00"}</div>
          </div>
          <div className="info-pedido-unico">
            <div>Preço total:</div>
            <div>R$ {produto ? produto.preco_venda * quantidade : "00,00"}</div>
          </div>
          <div className="info-pedido-unico">
            <div>Estoque:</div>
            <div>{produto ? produto.estoque_demanda : "00"}</div>
          </div>
          <div className="info-pedido-unico">
            <div>Saldo: </div>

            <div>{produto ? produto.estoque_demanda - quantidade : "00"}</div>
          </div>
        </div>
      </div>
      <div className="button">
        <IconButton onClick={() => onSubmitPedido(pedido)}>
          <AddBox color="primary" />
        </IconButton>
      </div>
    </div>
  );
}

{
  /*
    
    pub struct Pedido {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub cliente_id: ObjectId,
    pub produto: ObjectId,
    pub quantidade: f64,
    pub data: String,
    pub entrega: Option<String>,
    pub executado: bool,

}
    
    */
}
