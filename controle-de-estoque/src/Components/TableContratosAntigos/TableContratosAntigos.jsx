import { useEffect } from "react";
import "./TableContratosAntigos.css";
import {

  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import React from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  DeleteForever,
  PlayArrow,
  SendAndArchive,
  SendToMobile,
  Stop,
} from "@mui/icons-material";

export default function TableContratosAntigos({
  contratos,
  onDeleteContrato,
  onToggleContrato,
  dashBoardMode,
}) {
  
  const [produtos, setProdutos] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Carrega dados
  useEffect(() => {
    const loadData = async () => {
      if (!contratos?.length) {
        setLoading(false);
        return;
      }

      try {
        // Carrega produtos e clientes
        const produtosData = await Promise.all(
          [...new Set(contratos.map((c) => c.produto_id.$oid))].map((id) =>
            invoke("get_produto_by_id", { produtoId: id })
          )
        );
        setProdutos(produtosData);

        const clientesData = await Promise.all(
          [...new Set(contratos.map((c) => c.cliente_id.$oid))].map((id) =>
            invoke("get_cliente_by_id", { clienteId: id })
          )
        );
        setClientes(clientesData);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contratos]);

  // Renderiza tabela
  if (loading) return <div>Carregando...</div>;

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Periodo</TableCell>
              <TableCell>Recorrência</TableCell>
              <TableCell>Ativo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contratos.map((contrato, index) => {
              const produtoEncontrado = produtos.find(
                (p) => p._id.$oid === contrato.produto_id.$oid
              );
              const clienteEncontrado = clientes.find(
                (c) => c._id.$oid === contrato.cliente_id.$oid
              );

              if (!produtoEncontrado || !clienteEncontrado) return null;

              return (
                <TableRow key={index}>
                  <TableCell>{clienteEncontrado.nome}</TableCell>
                  <TableCell>{produtoEncontrado.nome}</TableCell>
                  <TableCell>{contrato.quantidade}</TableCell>
                  <TableCell>{formataData(contrato.data)}</TableCell>
                  <TableCell>{contrato.periodo}</TableCell>
                  <TableCell>
                    {showContratoType(contrato.periodo, contrato.valor_periodo)}
                  </TableCell>
                  <TableCell>{contrato.ativo ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    <div className="actions">
                      <Tooltip title="Deletar" arrow>
                        <IconButton
                          color="error"
                          onClick={() => onDeleteContrato(contrato._id)}
                        >
                          <DeleteForever />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Desativar" arrow>
                        <IconButton
                          color="black"
                          onClick={() => onToggleContrato(contrato._id)}
                        >
                          {contrato.ativo ? <Stop /> : <PlayArrow />}
                        </IconButton>
                      </Tooltip>

                      {Boolean(dashBoardMode) && (
                        <Tooltip title="Enviar Pedidos" arrow>
                          <IconButton
                            color="black"
                            onClick={() => console.log("Enviar Pedidos")}
                          >
                            <SendAndArchive />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

const showContratoType = (periodo, valorPeriodo) => {
  if (periodo === "Semanal") {
    const semanal = {
      0: "Segunda-feira",
      1: "Terça-feira",
      2: "Quarta-feira",
      3: "Quinta-feira",
      4: "Sexta-feira",
      5: "Sábado",
      6: "Domingo",
    };
    return semanal[valorPeriodo];
  } else if (periodo === "Mensal") {
    return `Dia ${valorPeriodo}`;
  } else if (periodo === "Intervalo") {
    return `A cada ${valorPeriodo} dias`;
  } else if (periodo === "SemanalMensal") {
    const semanalMensal = {
      0: "1ª Segunda-feira",
      1: "1ª Terça-feira",
      2: "1ª Quarta-feira",
      3: "1ª Quinta-feira",
      4: "1ª Sexta-feira",
      5: "1º Sábado",
      6: "1º Domingo",
      10: "2ª Segunda-feira",
      11: "2ª Terça-feira",
      12: "2ª Quarta-feira",
      13: "2ª Quinta-feira",
      14: "2ª Sexta-feira",
      15: "2º Sábado",
      16: "2º Domingo",
      20: "3ª Segunda-feira",
      21: "3ª Terça-feira",
      22: "3ª Quarta-feira",
      23: "3ª Quinta-feira",
      24: "3ª Sexta-feira",
      25: "3º Sábado",
      26: "3º Domingo",
      30: "4ª Segunda-feira",
      31: "4ª Terça-feira",
      32: "4ª Quarta-feira",
      33: "4ª Quinta-feira",
      34: "4ª Sexta-feira",
      35: "4º Sábado",
      36: "4º Domingo",
    };
    return semanalMensal[valorPeriodo];
  }
};

const formataData = (data) => {
  const dataSplit = data.split("-");
  return `${dataSplit[2]}/${dataSplit[1]}/${dataSplit[0]}`;
};
