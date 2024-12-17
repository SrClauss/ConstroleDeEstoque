#![allow(dead_code)]
use async_trait::async_trait;
use mongodb::bson::oid::ObjectId;
use crate::database::traits::crudable::Crudable;
use crate::database::traits::pedidos_recorrentes::{RecurrentOrderable, Periodicidade};
use crate::database::entities::pedido::Pedido;
use serde::{Deserialize, Serialize};
use crate::utilities::dia_semana_mes;
use mongodb::bson::{DateTime, to_bson};





#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PedidosSemanaisMensais{
    pub id: ObjectId,
    pub data: String,
    pub dias_recorrentes: Vec<u8>,
    /*
      os valores por dias concorrentes seguem o seguinte esquema
      uma dezena que representa qual a posição daquele dia da semana no mes
      uma unidade que representa o dia da semana, começando por domingo 1 a sabado 7
        ex:
        11 - primeiro domingo do mes
        21 - segundo domingo do mes
        12 - primeiro segunda do mes
        42 - quarta segunda do mes
        43 - quarta terça do mes
        33 - terceira terça do mes
     */
    pub pedidos: Option<Vec<Pedido>>,
    pub periodicidade: Periodicidade,
    
}

impl PedidosSemanaisMensais{
    pub fn new(
        data: String,
        dias_recorrentes: Vec<u8>,
        pedidos: Option<Vec<Pedido>>,
        
    ) -> Self {
        PedidosSemanaisMensais{
            id: ObjectId::new(),
            data,
            dias_recorrentes,
            pedidos,
            periodicidade: Periodicidade::DiaSemanaMensal,
            
        }
    }
}

#[async_trait]
impl Crudable for PedidosSemanaisMensais{
    fn collection_name() -> &'static str {
        "pedidos_recorrentes"
    }
    fn id(&self) -> String {
        self.id.to_string()
    }
    async fn find_all()->Result<Vec<PedidosSemanaisMensais>, String>{
        let periodicidade = serde_json::to_value(&Periodicidade::DiaSemanaMensal).unwrap();
        let values = PedidosSemanaisMensais::find_all_by_param("periodicidade", to_bson(&periodicidade).unwrap()).await?;
        if values.len() == 0{
            return Err("Nenhum pedido semanal mensal encontrado".to_string());
        }
        Ok(values.clone())
    }
}

#[async_trait]
impl RecurrentOrderable for PedidosSemanaisMensais{
    fn periodicidade_value()-> Periodicidade{
        Periodicidade::DiaSemanaMensal
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
            let dia_semana =  dia_semana_mes(day);
            if dia_semana.is_err(){
                return false;
            }
            let dia_semana = dia_semana.unwrap();

            if dias_recorrentes.contains(&dia_semana){
                return true;
            }
            false



     
    }
}




