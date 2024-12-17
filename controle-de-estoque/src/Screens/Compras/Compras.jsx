import React from 'react';
import CadastroContainer from '../../Components/CadastroContainer/CadastroContainer';
import SearchBar from '../../Components/SearchBar/SearchBar';
import SearchTable from '../../Components/SearchTable/SearchTable';
import RootScreen from '../RootScreen/RootScreen';
export default function Compras() {

    return (
        <RootScreen>
            <CadastroContainer title="Compras">
                <SearchBar onSubmitSearch={console.log} entidade={"Produto"} />
                <SearchTable data={produtos} columns={["Nome", "Preço", "Quantidade"]} onClickRow={setCurrentProduto} />
                <SearchTable data={fornecedores} columns={["Nome", "CNPJ", "Telefone"]} onClickRow={setCurrentFornecedor} />
                <SearchTable data={compras} columns={["Produto", "Fornecedor", "Quantidade", "Preço", "Data"]} onClickRow={setCurrentCompra} />
            </CadastroContainer>
        </RootScreen>
    )

}