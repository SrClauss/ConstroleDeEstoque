use crate::database::entities::endereco::Endereco;
use crate::database::traits::crudable::Crudable;
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};




#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Fornecedor {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub nome: String,
    pub cpf_cnpj: String,
    pub enderecos: Vec<Endereco>,
    pub telefone: String,
    pub email: String,
    pub data_criacao: String,
}

impl Fornecedor {
    pub fn new(

        nome: String,
        cpf_cnpj: String,
        enderecos: Vec<Endereco>,
        telefone: String,
        email: String,
        data_criacao: String,
    ) -> Result<Self, String> {
        
        Ok(Fornecedor {
            id:ObjectId::new(),
            nome,
            cpf_cnpj,
            enderecos,
            telefone,
            email,
            data_criacao,
        })
    }

    
}


#[async_trait]
impl Crudable for Fornecedor{

    fn collection_name() -> &'static str {
        "fornecedores"
    }
    fn id(&self) -> String {
        self.id.to_hex()
    }



}