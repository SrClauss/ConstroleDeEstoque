import {
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import "./PeriodoCombo.css";
import React from "react";
export default function PeriodoCombo({ onSetData, data }) {
  const [tipoPeriodo, setTipoPeriodo] = React.useState("");
  const [valorSemanal, setValorSemanal] = React.useState("");
  const [valorMensal, setValorMensal] = React.useState("");
  const [valorIntervalo, setValorIntervalo] = React.useState("");
  const [valorSemanalMensal, setValorSemanalMensal] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    const getvalor_periodo = () => {
      if (tipoPeriodo === "Semanal") {
        return valorSemanal;
      } else if (tipoPeriodo === "Mensal") {
        return valorMensal;
      } else if (tipoPeriodo === "Intervalo") {
        return valorIntervalo;
      } else if (tipoPeriodo === "SemanalMensal") {
        return valorSemanalMensal;
      } else {
        return "";
      }
    };
    onSetData({
      periodo: tipoPeriodo,
      valor_periodo: getvalor_periodo(),
    });
  }, [
    tipoPeriodo,
    valorSemanal,
    valorMensal,
    valorIntervalo,
    valorSemanalMensal,
  ]);

  const Semanal = [
    { value: "6", label: "Domingo" },
    { value: "0", label: "Segunda-feira" },
    { value: "1", label: "Terça-feira" },
    { value: "2", label: "Quarta-feira" },
    { value: "3", label: "Quinta-feira" },
    { value: "4", label: "Sexta-feira" },
    { value: "5", label: "Sábado" },
  ];

  const SemanalMensal = [
    { value: "0", label: "1ª Segunda-feira" },
    { value: "1", label: "1ª Terça-feira" },
    { value: "2", label: "1ª Quarta-feira" },
    { value: "3", label: "1ª Quinta-feira" },
    { value: "4", label: "1ª Sexta-feira" },
    { value: "5", label: "1º Sábado" },
    { value: "6", label: "1º Domingo" },
    { value: "10", label: "2ª Segunda-feira" },
    { value: "11", label: "2ª Terça-feira" },
    { value: "12", label: "2ª Quarta-feira" },
    { value: "13", label: "2ª Quinta-feira" },
    { value: "14", label: "2ª Sexta-feira" },
    { value: "15", label: "2º Sábado" },
    { value: "16", label: "2º Domingo" },
    { value: "20", label: "3ª Segunda-feira" },
    { value: "21", label: "3ª Terça-feira" },
    { value: "22", label: "3ª Quarta-feira" },
    { value: "23", label: "3ª Quinta-feira" },
    { value: "24", label: "3ª Sexta-feira" },
    { value: "25", label: "3º Sábado" },
    { value: "26", label: "3º Domingo" },
    { value: "30", label: "4ª Segunda-feira" },
    { value: "31", label: "4ª Terça-feira" },
    { value: "32", label: "4ª Quarta-feira" },
    { value: "33", label: "4ª Quinta-feira" },
    { value: "34", label: "4ª Sexta-feira" },
    { value: "35", label: "4º Sábado" },
    { value: "36", label: "4º Domingo" },
  ];

  return (
    <div className="root-periodo-combo">
  
      <TextField
        select
        size="small"
        label="Tipo de Periodo"
        value={data.periodo}
        onChange={(e) => {
          setTipoPeriodo(e.target.value);
        }}
        variant="outlined"
        fullWidth
      >
        <MenuItem value="">Selecione um tipo de periodo</MenuItem>
        <MenuItem value="Semanal">Semanal</MenuItem>
        <MenuItem value="Mensal">Mensal</MenuItem>
        <MenuItem value="Intervalo">Intervalo</MenuItem>
        <MenuItem value="SemanalMensal">Semanal/Mensal</MenuItem>
      </TextField>

      {data.periodo === "Semanal" && (
        <TextField
          select
          size="small"
          label="Dia da semana"
          value={data.valor_periodo}
          onChange={(e) => {
            setValorSemanal(e.target.value);
          }}
          variant="outlined"
          fullWidth
        >
          <MenuItem value="">Selecione um dia da semana</MenuItem>
          {Semanal.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      {data.periodo === "Mensal" && (
        <TextField
          size="small"
          label="Dia do mês"
          value={data.valor_periodo}
          onChange={(e) => {
            setValorMensal(e.target.value);
          }}
          onBlur={(e) => {
            if (
              e.target.value > 31 ||
              e.target.value < 1 ||
              e.target.value.includes(".") ||
              e.target.value.includes(",")
            ) {
              setErrorMessage("Dia do mês inválido");
              setOpen(true);
              setValorMensal("");
            }
          }}
          variant="outlined"
          fullWidth
        />
      )}
      {data.periodo === "Intervalo" && (
        <TextField
          size="small"
          label="Intervalo"
          value={data.valor_periodo}
          onChange={(e) => {
            setValorIntervalo(e.target.value);
          }}
          onBlur={(e) => {
            if (e.target.value.includes(".") || e.target.value.includes(",")) {
              setErrorMessage("Intervalo inválido");
              setOpen(true);
              setValorIntervalo("");
            }
          }}
          variant="outlined"
          fullWidth
        />
      )}
      {data.periodo === "SemanalMensal" && (
        <TextField
          select
          size="small"
          label="Dia da semana"
          value={data.valorSemanalMensal}
          onChange={(e) => {
            setValorSemanalMensal(e.target.value);
          }}
          variant="outlined"
          fullWidth
        >
          <MenuItem value="">Selecione um dia da semana</MenuItem>
          {SemanalMensal.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      {
        data.periodo === "" && (
          <></>
        )

      }
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Erro"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
