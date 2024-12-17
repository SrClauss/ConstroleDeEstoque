
#![allow(dead_code)]
use std::str::FromStr;
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;
use crate::database::traits::crudable::Crudable;
use crate::database::traits::pedidos_recorrentes::{RecurrentOrderable, Periodicidade};
use crate::database::entities::pedido::Pedido;
use serde::{Deserialize, Serialize};
use crate::utilities::bson_to_naive;
use mongodb::bson::{DateTime, to_bson};



#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PedidosPorIntervalo{
    pub id: ObjectId,
    pub data: String,
    pub dias_recorrentes: Vec<u8>,
    pub pedidos: Option<Vec<Pedido>>,
    pub periodicidade: Periodicidade,
}

impl PedidosPorIntervalo{
    pub fn new(
        data: String,
        dias_recorrentes: Vec<u8>,
        pedidos: Option<Vec<Pedido>>,
        
    ) -> Self {
        PedidosPorIntervalo{
            id: ObjectId::new(),
            data,
            dias_recorrentes,
            pedidos,
            periodicidade: Periodicidade::PorIntervalo,
            
        }
    }
}

#[async_trait]
impl Crudable for PedidosPorIntervalo{
    fn collection_name() -> &'static str {
        "pedidos_recorrentes"
    }
    fn id(&self) -> String {
        self.id.to_string()
    }
    async fn find_all()->Result<Vec<PedidosPorIntervalo>, String>{
        let periodicidade = serde_json::to_value(&Periodicidade::PorIntervalo).unwrap();
        let values = PedidosPorIntervalo::find_all_by_param("periodicidade", to_bson(&periodicidade).unwrap()).await?;
        if values.len() == 0{
            return Err("Nenhum pedido por intervalo encontrado".to_string());
        }
        Ok(values.clone())
    }
}

#[async_trait]
impl RecurrentOrderable for PedidosPorIntervalo{
    fn periodicidade_value()-> Periodicidade{
        Periodicidade::PorIntervalo
    }
    fn periodicidade(&self) -> Periodicidade {
        self.periodicidade.clone()
    }
    fn orders(&self) -> Vec<Pedido> {
        self.pedidos.clone().unwrap()
    }

    fn dias_recorrentes(&self) -> Vec<u8> {
        self.dias_recorrentes.clone()
    }
    async fn  has_client_orders_on_day(&self, day: DateTime) -> bool {
        let mut seed_data = chrono::NaiveDate::from_str(self.data.as_str()).unwrap();
        let day = bson_to_naive(day);
        while seed_data <= day{
            if seed_data == day{
                return true;
            }
            seed_data = seed_data.checked_add_signed(chrono::Duration::days(self.dias_recorrentes[0] as i64)).unwrap();
        }
        false

    }

    
}