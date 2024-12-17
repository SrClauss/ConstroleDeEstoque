use super::produto::Produto;
use crate::database::traits::crudable::{Crudable, Privilege};
use async_trait::async_trait;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

use super::fornecedor::Fornecedor;

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub enum TipoMovimentacao {
    Entrada,
    Saida,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Movimentacao {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub produto_id: ObjectId,
    pub fornecedor_id: Option<ObjectId>,
    pub cliente_id: Option<ObjectId>,
    pub tipo: TipoMovimentacao,
    pub quantidade: f64,
    pub data: String,
    pub comentario: Option<String>,
}

impl Movimentacao {
    pub fn new(
        produto_id: ObjectId,
        tipo: TipoMovimentacao,
        quantidade: f64,
        data: String,
        fornecedor_id: Option<ObjectId>,
        cliente_id: Option<ObjectId>,
        comentario: Option<String>,
    ) -> Result<Self, String> {
        Ok(Movimentacao {
            id: ObjectId::new(),
            produto_id,
            fornecedor_id,
            cliente_id,
            tipo,
            quantidade,
            data,
            comentario: comentario,
        })
    }
}

#[async_trait]
impl Crudable for Movimentacao {
    fn collection_name() -> &'static str {
        "movimentacoes"
    }
    fn id(&self) -> String {
        self.id.to_hex()
    }
    async fn create(self, privilege: Privilege) -> Result<Self, String>
    where
        Self: Sized,
    {
        if (privilege as i8) < (Self::privilege_for_create() as i8) {
            return Err("Insufficient privilege".to_string());
        }


        let mut movimentacao = self.clone();
        let produto = Produto::read(&movimentacao.produto_id.to_hex()).await;
        if produto.is_err() {

            
            return Err("Produto não encontrado".to_string());
        }
        let mut produto = produto.unwrap();

        match movimentacao.tipo {
            TipoMovimentacao::Entrada => {
                produto.estoque_demanda += movimentacao.quantidade;
                match movimentacao.fornecedor_id {
                    Some(fornecedor_id) => {
                        let fornecedor = Fornecedor::read(&fornecedor_id.to_hex()).await?;
                        movimentacao.comentario = Some(format!("Compra de {} de {} do fornecedor {}", movimentacao.quantidade, produto.nome, fornecedor.nome));
                    }
                    None => {
                        movimentacao.comentario = Some(format!("Entrada de {} de {}", movimentacao.quantidade, produto.nome));
                    }
                }

                produto.update(Privilege::Admin).await?;
            }
            TipoMovimentacao::Saida => {
                produto.estoque_demanda -= movimentacao.quantidade;
                match movimentacao.cliente_id {
                    Some(cliente_id) => {
                        movimentacao.comentario = Some(format!("Venda de {} de {} para o cliente {}", movimentacao.quantidade, produto.nome, cliente_id));
                    }
                    None => {
                        movimentacao.comentario = Some(format!("Saída de {} de {}", movimentacao.quantidade, produto.nome));
                    }
                }
                produto.update(Privilege::User).await?;
                
            }
        }

   



        let collection = Self::collection().await;

        collection
            .insert_one(movimentacao.clone())
            .await
            .map_err(|e| e.to_string())?;

   

        produto.update(Privilege::Admin).await?;



        Ok(movimentacao)

    }
}
