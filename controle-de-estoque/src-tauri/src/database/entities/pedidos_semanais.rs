#![allow(dead_code)]
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;
use crate::database::traits::crudable::Crudable;
use crate::database::traits::pedidos_recorrentes::{RecurrentOrderable, Periodicidade};
use crate::database::entities::pedido::Pedido;
use serde::{Deserialize, Serialize};
use mongodb::bson::{DateTime, to_bson};
use crate::utilities::weekday;





#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PedidosSemanais{
    pub id: ObjectId,
    pub data: String,
    pub dias_recorrentes: Vec<u8>,
    pub pedidos: Option<Vec<Pedido>>,
    pub periodicidade: Periodicidade,

    
}

impl PedidosSemanais{
    pub fn new(
        data: String,
        dias_recorrentes: Vec<u8>,
        pedidos: Option<Vec<Pedido>>,
        
    ) -> Self {
        PedidosSemanais{
            id: ObjectId::new(),
            data,
            dias_recorrentes,
            pedidos,
            periodicidade: Periodicidade::Semanal,
            
        }
    }
}


#[async_trait]
impl Crudable for PedidosSemanais{
    fn collection_name() -> &'static str {
        "pedidos_recorrentes"
    }
    fn id(&self) -> String {
        self.id.to_string()
    }
    async fn find_all()->Result<Vec<PedidosSemanais>, String>{
        let periodicidade = serde_json::to_value(&Periodicidade::Semanal).unwrap();
        let values = PedidosSemanais::find_all_by_param("periodicidade", to_bson(&periodicidade).unwrap()).await?;
        if values.len() == 0{
            return Err("Nenhum pedido semanal encontrado".to_string());
        }
        Ok(values.clone())
    }
}

#[async_trait]
impl RecurrentOrderable for PedidosSemanais{

    fn periodicidade_value()-> Periodicidade{
        Periodicidade::Semanal
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

    async fn has_client_orders_on_day(&self, day: DateTime) -> bool {

        let dias_recorrentes = self.dias_recorrentes();
        let weekday = weekday(day);
        if dias_recorrentes.contains(&weekday){
            return true;
        }
        false
        
    }
   
}