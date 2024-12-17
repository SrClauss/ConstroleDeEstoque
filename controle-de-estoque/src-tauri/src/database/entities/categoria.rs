use crate::database::traits::crudable::Crudable;
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};



#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Categoria{
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub nome: String,
    pub descricao: String,
}


impl Categoria {
    pub fn new(

        nome: String,
        descricao: String,
    ) -> Result<Self, String> {
        Ok(Categoria {
            id: ObjectId::new(),
            nome,
            descricao,
        })
    }
}

#[async_trait]
impl Crudable for Categoria{
    fn collection_name() -> &'static str {
        "categorias"
    }
    fn id(&self) -> String {
        self.id.to_hex()
    }

    

}