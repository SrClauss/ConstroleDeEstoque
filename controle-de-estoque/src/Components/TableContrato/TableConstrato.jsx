import "./TableContrato.css";
import { DeleteForever } from "@mui/icons-material";
import {
    Button,
    IconButton,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import React from "react";

export default function TableContrato({
    contratos,
    onDeleteContrato,
    produtos,
    onSubmitAllContratos,
}) {
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

    return (
        <div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell>Quantidade</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Recorrencia</TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {contratos.map((contrato, index) => {
                        const produto = produtos.find(
                            (produto) => produto._id.$oid === contrato.produto.$oid
                        ).nome;

                        return (
                            <TableRow key={index}>
                                <TableCell>{produto}</TableCell>
                                <TableCell>{contrato.quantidade}</TableCell>
                                <TableCell>{contrato.periodo}</TableCell>
                                <TableCell>
                                    {showContratoType(
                                        contrato.periodo,
                                        contrato.valor_periodo
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => onDeleteContrato(contrato.idProvisorio)}>
                                        <DeleteForever color="error" />
                                    </IconButton>{" "}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <div className="button-gravar-contratos">
                <Button
                    onClick={() => {
                        onSubmitAllContratos(contratos);
                    }}
                    fullWidth
                    variant="contained"
                    color="primary"
                >
                    Gravar Todos Contratos
                </Button>
            </div>
        </div>
    );
}
