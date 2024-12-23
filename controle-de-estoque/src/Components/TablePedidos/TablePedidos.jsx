import "./TablePedidos.css";
import { DeleteForever } from "@mui/icons-material";
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect } from "react";
export default function TablePedidos({ pedidos, onDeletePedido, produtos, onSubmitAllPedidos }) {


  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell>Quantidade</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Entrega</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {pedidos.map((pedido, index) => {
            const produto = produtos.find(
              (produto) => produto._id.$oid === pedido.produto.$oid
            ).nome;

            return (
              <TableRow key={index}>
                <TableCell>{produto}</TableCell>
                <TableCell>{pedido.quantidade}</TableCell>
                <TableCell>{formatDate(pedido.data)}</TableCell>
                <TableCell>{formatDate(pedido.entrega)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onDeletePedido(pedido)}>
                    <DeleteForever color="error" />
                  </IconButton>{" "}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {

        pedidos.length === 0 ? (<div className="empty-table">Nenhum pedido cadastrado</div>):(<div className="button-gravar-pedidos">
        
            <Button onClick={()=>{onSubmitAllPedidos(pedidos)}} fullWidth variant="contained" color="primary">
              Gravar Todos Pedidos
            </Button>
          </div>)


      }
      
    </>
  );
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
