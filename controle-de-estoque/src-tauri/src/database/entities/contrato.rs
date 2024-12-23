use crate::database::entities::pedido::Pedido;

use crate::database::traits::crudable::{Crudable, Privilege};
use chrono::Datelike;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use std::str::FromStr;


//crie uma enum para periodo

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum Periodo {
    Semanal, //trata-se de contratos para entrega semanal com um dia da semana, ex: Toda Terça
    Mensal,  //trata-se de contratos para entrega mensal com um dia do mês, ex: Todo dia 10
    PorIntervalo, //trata-se de contratos para entrega por intervalo de dias, ex: A cada 15 dias
    SemanalMensal, //trata-se de contratos para entrega em um dia da semana em determinado semana do mes, ex: toda 1ª terça do mês
}
impl FromStr for Periodo {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Semanal" => Ok(Periodo::Semanal),
            "Mensal" => Ok(Periodo::Mensal),
            "PorIntervalo" => Ok(Periodo::PorIntervalo),
            "SemanalMensal" => Ok(Periodo::SemanalMensal),
            _ => Err(format!("'{}' is not a valid Periodo", s)),
        }
    }
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Contrato {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub cliente_id: ObjectId,
    pub produto_id: ObjectId,
    pub quantidade: f64,
    pub data: String, //data de inicio do contrato
    pub periodo: Periodo,
    pub valor_periodo: u8, //esta varriavel vai armazenar os valores dos contratos que seguirão um esquema explicado abaixo
    pub ativo: bool,       /*
                           se periocidade for Semanal, valor_periodo será o dia da semana, onde 0 = segunda, 1 = terça, 2 = quarta, 3 = quinta, 4 = sexta, 5 = sábado, 6 = domingo
                           se periocidade for PorIntervalo, valor_periodo será o intervalo de dias a partir da data de inicio do contrato
                           se periocidade for SemanalMensal, valor_periodo será o dia da semana e a semana do mês onde a dezena é qual semana do mês será a entrega do contrato e as unidades a semana
                           exemplo:
                           0 =  1ª segunda do mês, 1 = 1ª terça do mês, 2 = 1ª quarta do mês, 3 = 1ª quinta do mês, 4 = 1ª sexta do mês, 5 = 1ª sábado do mês, 6 = 1ª domingo do mês
                           10 = 2ª segunda do mês, 11 = 2ª terça do mês, 12 = 2ª quarta do mês, 13 = 2ª quinta do mês, 14 = 2ª sexta do mês, 15 = 2ª sábado do mês, 16 = 2ª domingo do mês
                           20 = 3ª segunda do mês, 21 = 3ª terça do mês, 22 = 3ª quarta do mês, 23 = 3ª quinta do mês, 24 = 3ª sexta do mês, 25 = 3ª sábado do mês, 26 = 3ª domingo do mês
                           30 = 4ª segunda do mês, 31 = 4ª terça do mês, 32 = 4ª quarta do mês, 33 = 4ª quinta do mês, 34 = 4ª sexta do mês, 35 = 4ª sábado do mês, 36 = 4ª domingo do mês

                           não consideramos a possibilidade de um mês ter 5 semanas




                            */
}

impl Contrato {
    pub fn new(
        cliente_id: ObjectId,
        produto_id: ObjectId,
        quantidade: f64,
        data: String,
        periodo: Periodo,
        valor_periodo: u8,
        ativo: bool,
    ) -> Result<Self, String> {
        Ok(Contrato {
            id: ObjectId::new(),
            cliente_id,
            produto_id,
            quantidade,
            data,
            periodo,
            valor_periodo,
            ativo,
        })
    }
    pub fn has_delivery_in_date(&self, date: String) -> bool {
        if self.periodo == Periodo::Semanal {
            let date = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap();
            let day = date.weekday().num_days_from_monday() as i64;
            if day == self.valor_periodo as i64 {
                return true;
            }
            return false;
        } else if self.periodo == Periodo::Mensal {
            let date = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap();
            let day = date.day() as u8;
            if day == self.valor_periodo {
                return true;
            }
            return false;
        } else if self.periodo == Periodo::PorIntervalo {
            let date = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap();
            let start_date = chrono::NaiveDate::parse_from_str(&self.data, "%Y-%m-%d").unwrap();
            let days = date.signed_duration_since(start_date).num_days();
            if days % self.valor_periodo as i64 == 0 {
                return true;
            }
            return false;
        } else if self.periodo == Periodo::SemanalMensal {
            let date = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d").unwrap();
            let day_week = date.weekday().num_days_from_monday() as i64;
            let mut weeks: [u8; 4] = [0; 4];
            let mut i = 0;
            for d in 1..32 {
                let date = chrono::NaiveDate::from_ymd_opt(date.year(), date.month(), d).unwrap();
                if date.weekday().num_days_from_monday() as i64 == day_week {
                    weeks[i] =
                        ((i as i32) * 10 + date.weekday().num_days_from_monday() as i32) as u8;
                    i += 1;
                }
            }

            if weeks.contains(&self.valor_periodo) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    pub async fn create_pedido_from_contrato(&self, date: String) -> Result<String, String> {
        let pedido = Pedido::new(
            self.cliente_id.clone(),
            self.produto_id.clone(),
            self.quantidade,
            date.clone(),
            Some(date.clone()),
            false,
        )?;
        let new_pedido = pedido.create(Privilege::Admin).await?;
        Ok(new_pedido.id())
    }

    pub async fn contratos_with_delivery_in_date(date: String) -> Result<Vec<Contrato>, String> {
        let contratos = Contrato::find_all().await?;
        let mut contratos_with_delivery = Vec::new();
        for contrato in contratos {
            if contrato.has_delivery_in_date(date.clone()) {
                contratos_with_delivery.push(contrato);
            }
        }
        Ok(contratos_with_delivery)
    }
}
impl Crudable for Contrato {
    fn collection_name() -> &'static str {
        "contrato"
    }
    fn id(&self) -> String {
        self.id.to_hex()
    }
}
//crie um teste para a função has_delivery_in_date
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_has_delivery_in_date_semanal() {
        let contrato = Contrato::new(
            ObjectId::new(),
            ObjectId::new(),
            10.0,
            "2024-10-10".to_string(),
            Periodo::Semanal,
            3, //3 representa uma quinta feira
            true,
        )
        .unwrap();
        assert_eq!(
            contrato.has_delivery_in_date("2024-12-19".to_string()),
            true
        ); //quinta feira
        assert_eq!(
            contrato.has_delivery_in_date("2024-12-18".to_string()),
            false
        ); //quarta feira
    }
    #[test]
    fn test_has_delivery_in_date_mensal() {
        let contrato = Contrato::new(
            ObjectId::new(),
            ObjectId::new(),
            10.0,
            "2024-10-10".to_string(),
            Periodo::Mensal,
            10, //todo dia 10
            true,
        )
        .unwrap();
        assert_eq!(
            contrato.has_delivery_in_date("2024-12-10".to_string()),
            true
        ); //dia 10
        assert_eq!(
            contrato.has_delivery_in_date("2024-12-11".to_string()),
            false
        ); //dia 11
    }
    #[test]
    fn test_has_delivery_in_date_por_intervalo() {
        let contrato = Contrato::new(
            ObjectId::new(),
            ObjectId::new(),
            10.0,
            "2024-10-10".to_string(),
            Periodo::PorIntervalo,
            15, //a cada 15 dias
            true,
        )
        .unwrap();
        assert_eq!(
            contrato.has_delivery_in_date("2024-10-25".to_string()),
            true
        ); //15 dias depois
        assert_eq!(
            contrato.has_delivery_in_date("2024-10-26".to_string()),
            false
        ); //16 dias depois
    }
    #[test]
    fn test_has_delivery_in_date_semanal_mensal() {
        let contrato = Contrato::new(
            ObjectId::new(),
            ObjectId::new(),
            10.0,
            "2024-10-10".to_string(),
            Periodo::SemanalMensal,
            33, //3ª quinta do mês
            true,
        )
        .unwrap();
        assert_eq!(
            contrato.has_delivery_in_date("2024-12-19".to_string()),
            true
        ); //3ª quinta do mês
        assert_eq!(
            contrato.has_delivery_in_date("2024-12-18".to_string()),
            false
        ); //3ª quarta do mês
    }
}
