use crate::database::traits::crudable::{Crudable, Privilege};
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};
use crate::database::entities::movimentacao::Movimentacao;

use super::movimentacao::TipoMovimentacao;

#[derive(Debug, Serialize, Deserialize, Clone)]

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

impl Pedido {
    pub fn new(
        cliente_id: ObjectId,
        produto: ObjectId,
        quantidade: f64,
        data: String,
        entrega: Option<String>,
        executado: bool,
        
    ) -> Result<Self, String> {
        Ok(Pedido {
            id: ObjectId::new(),
            cliente_id,
            produto,
            quantidade,
            data,
            entrega,
            executado,
       
        })
    }

    pub async fn movimenta_estoque(&self ) -> Result<String, String> {
        let movimentacao = Movimentacao::new(
            self.produto.clone(),
            TipoMovimentacao::Saida,
            self.quantidade,
            self.entrega.clone().unwrap(),
            None,
            Some(self.cliente_id.clone()),
            None
        )?;

        let new_movimentacao = movimentacao.create(Privilege::Admin).await?;
        Ok(new_movimentacao.comentario.unwrap())
    }
}


#[async_trait]
impl Crudable for Pedido{
    fn collection_name() -> &'static str {
        "pedidos"
    }
    fn id(&self) -> String {
        self.id.to_hex()
    }

}

