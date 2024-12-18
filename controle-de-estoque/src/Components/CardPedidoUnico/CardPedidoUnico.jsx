export default function CardPedidoUnico({ pedido, cliente, produto }) {
    return(
        <div>
            <p>Cliente: {cliente.nome}</p>
            <p>Produto: {produto.nome}</p>
            <p>Quantidade: {pedido.quantidade}</p>
            <p>Data: {pedido.data}</p>
            <p>Entrega: {pedido.entrega}</p>
            <p>Valor Total: {pedido.quantidade * produto.preco_venda}</p>


            </div>


    )
}


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