use crate::database::traits::crudable::{Crudable, Privilege};

use bcrypt;
use bcrypt::DEFAULT_COST;
use mongodb::bson::oid::ObjectId;
use serde::{Serialize, Deserialize};
use mongodb::bson::doc;
use async_trait::async_trait;




#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub privilege: i8,
}



impl User{
    pub fn new(name: String, email: String, password: String, privilege: i8) -> Self {
        let password_hash = bcrypt::hash(password, DEFAULT_COST).unwrap();
        Self {
            id: None,
            name,
            email,
            password_hash,
            privilege,
        }
    
    }
    pub fn verify_password(&self, password: &str) -> Result<bool, String> {
        let verification = match bcrypt::verify(password, &self.password_hash) {
            Ok(result) => result,
            Err(e) => return Err(e.to_string()),
        };

        Ok(verification)
       
    }
}

#[async_trait]
impl Crudable for User {

    fn collection_name() -> &'static str {
        "users"
    }
    fn id(&self) -> String {
        self.id.as_ref().unwrap().to_hex()
    }
    fn privilege_for_create() -> Privilege {
        Privilege::SuperUser
    }
    fn privilege_for_update() -> Privilege {
        Privilege::SuperUser
    }
    fn privilege_for_delete() -> Privilege {
        Privilege::SuperUser
    }
    
    

}
