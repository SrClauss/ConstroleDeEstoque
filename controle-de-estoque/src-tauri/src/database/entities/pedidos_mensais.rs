#![allow(dead_code)]
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;

use crate::database::traits::crudable::Crudable;
use crate::database::traits::pedidos_recorrentes::{RecurrentOrderable, Periodicidade};
use crate::database::entities::pedido::Pedido;
use serde::{Deserialize, Serialize};
use mongodb::bson::{doc, DateTime, to_bson};

use crate::utilities::dia_mes;




#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PedidosMensais{
    pub id: ObjectId,
    pub data: String,
    pub dias_recorrentes: Vec<u8>,
    pub pedidos: Option<Vec<Pedido>>,
    pub periodicidade: Periodicidade,

    
}

impl PedidosMensais{
    pub fn new(
        data: String,
        dias_recorrentes: Vec<u8>,
        pedidos: Option<Vec<Pedido>>,
        
    ) -> Self {
        PedidosMensais{
            id: ObjectId::new(),
            data,
            dias_recorrentes,
            pedidos,
            periodicidade: Periodicidade::Mensal,
            
        }
    }
}

#[async_trait]
impl Crudable for PedidosMensais{
    fn collection_name() -> &'static str {
        "pedidos_recorrentes"
    }
    fn id(&self) -> String {
        self.id.to_string()
    }
    async fn find_all()->Result<Vec<PedidosMensais>, String>{
        let periodicidade = serde_json::to_value(&Periodicidade::Mensal).unwrap();
        let values = PedidosMensais::find_all_by_param("periodicidade", to_bson(&periodicidade).unwrap()).await?;
        if values.len() == 0{
            return Err("Nenhum pedido mensal encontrado".to_string());
        }
        Ok(values.clone())
    }
   
}
#[async_trait]
impl RecurrentOrderable for PedidosMensais{
    fn periodicidade_value()-> Periodicidade{
        Periodicidade::Mensal
    }
    
    fn periodicidade(&self) -> Periodicidade {
        self.periodicidade.clone()
    }
    fn dias_recorrentes(&self) -> Vec<u8> {
        self.dias_recorrentes.clone()
    }
    fn orders(&self) -> Vec<Pedido> {
        self.pedidos.clone().unwrap()
    }

    async fn has_client_orders_on_day(&self, dia: DateTime) -> bool {
        let dia_mes = dia_mes(dia);
        self.dias_recorrentes.contains(&dia_mes)

    }



}



