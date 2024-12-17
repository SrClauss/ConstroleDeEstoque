use mongodb::bson::doc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Endereco {
    pub nome_endereco: String,
    pub logradouro: String,
    pub numero: i32,
    pub bairro: String,
    pub cidade: String,
    pub estado: String,
    pub cep: String,
    pub complemento: String,
    pub referencia: String,

}

impl Endereco {
    pub fn new(
        nome_endereco: String,
        logradouro: String,
        numero: i32,
        bairro: String,
        cidade: String,
        estado: String,
        cep: String,
        complemento: String,
        referencia: String,

    ) -> Result<Self, String> {
        
        Ok(Endereco{
            nome_endereco,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
            referencia,
       
        })
    }

    
}
