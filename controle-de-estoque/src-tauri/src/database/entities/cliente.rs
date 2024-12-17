use crate::database::entities::endereco::Endereco;
use crate::database::traits::crudable::Crudable;
use async_trait::async_trait;
use mongodb::bson::doc;
use mongodb::results::DeleteResult;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use super::pedido::Pedido;
use super::pedidos_semanais::PedidosSemanais;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Cliente {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub nome: String,
    pub email: String,
    pub telefone: String,
    pub cpf_cnpj: String,
    pub data_nascimento: String,
    pub enderecos: Vec<Endereco>,
}

impl Cliente {
    pub fn new(
        nome: String,
        email: String,
        telefone: String,
        cpf_cnpj: String,
        data_nascimento: String,
        enderecos: Vec<Endereco>,
    ) -> Result<Self, String> {
        Ok(Cliente {
            id: ObjectId::new(),
            nome,
            email,
            telefone,
            cpf_cnpj,
            data_nascimento,
            enderecos,
        })
    }
    pub fn pessoa_fisica(&self) -> bool {
        self.cpf_cnpj.len() == 11
    }
    pub async fn cascade_delete(&self) -> Result<Vec<DeleteResult>, String> {
        let mut  delete_results: Vec<DeleteResult> = Vec::new();
        let collection_pedidos_recorrentes = PedidosSemanais::collection().await;
        let collection_pedidos = Pedido::collection().await;
        let self_id = ObjectId::parse_str(self.id.to_hex().as_str()).unwrap();
        let filter_pedidos_recorrentes = doc! {
            "pedidos.0.cliente_id": self_id
        };
        let filter_pedidos = doc! {
            "cliente_id": self_id
        };
        let pedidos_recorrentes = collection_pedidos_recorrentes
            .delete_many(filter_pedidos_recorrentes)
            .await
            .map_err(|e| e.to_string())?;
        if pedidos_recorrentes.deleted_count > 0 {
            delete_results.push(pedidos_recorrentes);
        }

        let pedidos = collection_pedidos
            .delete_many(filter_pedidos)
            .await
            .map_err(|e| e.to_string())?;
        if pedidos.deleted_count > 0 {
            delete_results.push(pedidos);
        }
        
        return Ok(delete_results);

        


        
        
        
    }
}

#[async_trait]
impl Crudable for Cliente {
    fn collection_name() -> &'static str {
        "clientes"
    }
    fn id(&self) -> String {
        self.id.to_hex()
    }
}
