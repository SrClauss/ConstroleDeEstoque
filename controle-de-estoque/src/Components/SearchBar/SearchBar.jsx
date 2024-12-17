
import './SearchBar.css';
import React from 'react';
import { Button, TextField } from '@mui/material';
import { Search, SearchOffSharp } from '@mui/icons-material';
export default function SearchBar({onSubmitSearch, entidade}){

    const [search, setSearch] = React.useState("");
    
    const handleSearch = () => {
        onSubmitSearch(search);
    }
    
    return (
        <div className="search-bar-container">
        <TextField
            size={"small"}
            label={"Buscar " + entidade}
            onKeyDown={(e) => {
                if(e.key === "Enter"){
    
                    handleSearch();
                }
            }}
            fullWidth
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        <Button
            onClick={handleSearch}
            variant="contained"
            color="primary"
        >
           <Search />
        </Button>
        </div>
    )
}