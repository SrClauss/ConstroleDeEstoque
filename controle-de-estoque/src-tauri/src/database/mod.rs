pub mod entities;
pub mod traits;
use crate::env;
use mongodb::options::ClientOptions;
use mongodb::{Client, Database};



pub async fn connect() -> Database {
    let mongo_db_uri = env::MONGODB_URI;
    let client_options = ClientOptions::parse(mongo_db_uri)
        .await
        .expect("Failed to parse client options");

    let client = Client::with_options(client_options).expect("Failed to create client");
    let db_name = env::DATABASE_NAME;
    client.database(&db_name)
    
}

/*
crie em src-tauri/src/env/mod.rs as constantes MONGODB_URI, DATABASE_NAME, DEFAULT_USER_EMAIL e DEFAULT_USER_PASSWORD
pois as coloquei no gitignore

*/