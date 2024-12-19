import { Table, TableRow, TableCell, TableBody, TableHead } from "@mui/material";
import { useEffect, useRef } from "react";
import React from "react";
import "./SearchTable.css";
export default function SearchTable({
  data,
  onDataChange,
  stateSelected,
  nullData,
}) {
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [currentId, setCurrentId] = React.useState(null);

  useEffect(() => {
    setSelectedRow(null);
  }, [stateSelected]);
  const handleSelect = (id, index, response) => {
    if (index === selectedRow) {
      setSelectedRow(null);
      setCurrentId(null);
      onDataChange(nullData);

      return;
    }
    setSelectedRow(index);
    setCurrentId(id);
    onDataChange(response);
  };
  if (!data || !data.headers || !data.rows) {
    return null;
  }
  const headers = data.headers;
  const rows = data.rows;
  return (
    <div className="root-table">
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell key={index}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <ValueRow
              key={index}
              selected={index === selectedRow}
              cells={row}
              onDoubleClick={(id, response) =>
                handleSelect(id, index, response)
              }
              response={data.response[index]}
            ></ValueRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ValueRow({ selected, cells, onDoubleClick, response }) {
  return (
    <TableRow
      className={selected ? "primary-background" : ""}
      onDoubleClick={() => onDoubleClick(cells[0], response)}
    >
      {cells.map((cell, index) => (
        <TableCell key={index} sx={{ cursor: "pointer" }}>
          {cell}
        </TableCell>
      ))}
    </TableRow>
  );
}
