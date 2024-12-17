use crate::database::traits::crudable::Crudable;
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]

pub struct Produto {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub nome: String,
    pub categoria_id: ObjectId,
    pub preco_compra: f64,
    pub preco_venda: f64,
    pub unidade: String,
    pub estoque_demanda: f64,
    
}

impl Produto {
    pub fn new(
        nome: String,
        categoria_id: ObjectId,
        preco_compra: f64,
        preco_venda: f64,
        unidade: String
        
        
    ) -> Result<Self, String> {
        Ok(Produto {
            id: ObjectId::new(),
            nome,
            categoria_id,
            preco_compra,
            preco_venda,
            unidade,
            estoque_demanda: 0.0,
            
        })

    }
   
   

   
}

#[async_trait]
impl Crudable for Produto{
    fn collection_name() -> &'static str {
        "produtos"
    }
    fn id(&self) -> String {
        self.id.to_hex()
    }

}