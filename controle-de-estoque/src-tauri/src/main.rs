// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
pub mod database;
pub mod env;
pub mod utilities;
use database::entities::movimentacao::{Movimentacao, TipoMovimentacao};
use database::entities::pedidos_mensais::PedidosMensais;
use database::entities::pedidos_por_intervalo::PedidosPorIntervalo;
use database::entities::pedidos_semana_mensal::PedidosSemanaisMensais;
use database::entities::pedidos_semanais::PedidosSemanais;
use database::entities::{
    categoria::Categoria, cliente::Cliente, endereco::Endereco, fornecedor::Fornecedor,
    pedido::Pedido, produto::Produto, user::User,
};
use database::traits::crudable::{Crudable, Privilege};
use database::traits::pedidos_recorrentes::RecurrentOrderable;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Bson, DateTime};
use serde_json::Value;
use std::str::FromStr;
use tauri::async_runtime::block_on;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

async fn create_a_admin_if_dont_exists() -> Result<String, String> {
    let user = User::find_first_by_param("privilege", Bson::Int32(Privilege::Admin as i32)).await;

    if user.is_ok() {
        return Ok(format!(
            "Admin with id {:?} already exists",
            user.unwrap().id.unwrap().to_hex()
        ));
    }
    let user = User::new(
        "admin".to_string(),
        "admin".to_string(),
        "admin".to_string(),
        Privilege::Admin as i8,
    );

    let user = user.create(Privilege::Admin).await;

    if user.is_err() {
        return Err(user.err().unwrap());
    }
    let user = user.unwrap();

    return Ok(format!("Admin with id {:?} created", user.id));
}
#[tauri::command]
async fn create_a_cliente(data: Value) -> Result<Cliente, String> {
    let enderecos_values = data.get("enderecos");
    if enderecos_values.is_none() {
        return Err("Endereços não informados".to_string());
    }
    let enderecos_values = enderecos_values.unwrap().as_array().unwrap();
    let mut enderecos: Vec<Endereco> = Vec::new();
    for endereco_value in enderecos_values {
        let endereco = Endereco::new(
            endereco_value["nome_endereco"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["logradouro"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["numero"].as_i64().unwrap_or(0) as i32,
            endereco_value["bairro"].as_str().unwrap_or("").to_string(),
            endereco_value["cidade"].as_str().unwrap_or("").to_string(),
            endereco_value["estado"].as_str().unwrap_or("").to_string(),
            endereco_value["cep"].as_str().unwrap_or("").to_string(),
            endereco_value["complemento"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["referencia"]
                .as_str()
                .unwrap_or("")
                .to_string(),
        );
        if endereco.is_err() {
            return Err(endereco.err().unwrap());
        }
        enderecos.push(endereco.unwrap());
    }
    let cliente = Cliente::new(
        data["nome"].as_str().unwrap_or("").to_string(),
        data["email"].as_str().unwrap_or("").to_string(),
        data["telefone"].as_str().unwrap_or("").to_string(),
        data["cpf_cnpj"].as_str().unwrap_or("").to_string(),
        data["data_nascimento"].as_str().unwrap_or("").to_string(),
        enderecos,
    );
    if cliente.is_err() {
        return Err(cliente.err().unwrap());
    }
    let cliente = cliente.unwrap();
    let cliente = cliente.create(Privilege::Admin).await;
    if cliente.is_err() {
        return Err(cliente.err().unwrap());
    }
    Ok(cliente.unwrap())
}
#[tauri::command]
async fn delete_cliente(cliente_id: &str) -> Result<String, String> {
    let cliente = Cliente::read(cliente_id).await?;
    let cliente_cascade_delete = cliente.cascade_delete().await;
    if cliente_cascade_delete.is_err() {
        return Err(cliente_cascade_delete.err().unwrap() + " - Cliente não deletado");
    }
    let cliente = Cliente::read(cliente_id).await?;
    let cliente = cliente.delete(Privilege::Admin).await;

    match cliente {
        Ok(_) => Ok(format!(
            "Cliente {:?} deletado com sucesso",
            cliente.unwrap().nome
        )),
        Err(e) => Err(e),
    }
}
#[tauri::command]
async fn update_cliente(data: Value) -> Result<String, String> {
    println!("{:?}", data);
   

    let cliente_id = data["_id"]["$oid"].as_str().unwrap_or("");
    let cliente = Cliente::read(cliente_id).await;
    if cliente.is_err() {
        return Err(cliente.err().unwrap());
    }
    let mut cliente = cliente.unwrap();
    cliente.nome = data["nome"].as_str().unwrap_or("").to_string();
    cliente.email = data["email"].as_str().unwrap_or("").to_string();
    cliente.telefone = data["telefone"].as_str().unwrap_or("").to_string();
    cliente.cpf_cnpj = data["cpf_cnpj"].as_str().unwrap_or("").to_string();
    cliente.data_nascimento = data["data_nascimento"].as_str().unwrap_or("").to_string();
    let enderecos_values = data.get("enderecos");
    if enderecos_values.is_none() {
        return Err("Endereços não informados".to_string());
    }
    let enderecos_values = enderecos_values.unwrap().as_array().unwrap();
    let mut enderecos: Vec<Endereco> = Vec::new();
    for endereco_value in enderecos_values {
        let endereco = Endereco::new(
            endereco_value["nome_endereco"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["logradouro"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["numero"].as_i64().unwrap_or(0) as i32,
            endereco_value["bairro"].as_str().unwrap_or("").to_string(),
            endereco_value["cidade"].as_str().unwrap_or("").to_string(),
            endereco_value["estado"].as_str().unwrap_or("").to_string(),
            endereco_value["cep"].as_str().unwrap_or("").to_string(),
            endereco_value["complemento"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["referencia"]
                .as_str()
                .unwrap_or("")
                .to_string(),
        );
        if endereco.is_err() {
            return Err(endereco.err().unwrap());
        }
        enderecos.push(endereco.unwrap());
    }
    cliente.enderecos = enderecos;
    let cliente = cliente.update(Privilege::Admin).await;
    if cliente.is_err() {
        return Err(cliente.err().unwrap());
    }
    Ok("Cliente atualizado com sucesso".to_string())
}
#[tauri::command]
async fn login(data: Value) -> Result<String, String> {
    let email = data["email"].as_str().unwrap_or("").to_string();
    let password = data["password"].as_str().unwrap_or("").to_string();

    let user = User::find_first_by_param("email", Bson::String(email)).await;
    if user.is_err() {
        return Err(user.err().unwrap());
    }
    let user = user.unwrap();

    let verify_password = user.verify_password(&password);
    if verify_password.is_err() {
        return Err(verify_password.err().unwrap());
    }
    let verify_password = verify_password.unwrap();
    if verify_password {
        return Ok("Login efetuado com sucesso".to_string());
    }
    Err("Senha inválida".to_string())
}
#[tauri::command]
async fn create_a_fornecedor(data: Value) -> Result<String, String> {
    let enderecos_values = data.get("enderecos");
    if enderecos_values.is_none() {
        return Err("Endereços não informados".to_string());
    }
    let enderecos_values = enderecos_values.unwrap().as_array().unwrap();
    let mut enderecos: Vec<Endereco> = Vec::new();
    for endereco_value in enderecos_values {
        let endereco = Endereco::new(
            endereco_value["nome_endereco"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["logradouro"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["numero"].as_i64().unwrap_or(0) as i32,
            endereco_value["bairro"].as_str().unwrap_or("").to_string(),
            endereco_value["cidade"].as_str().unwrap_or("").to_string(),
            endereco_value["estado"].as_str().unwrap_or("").to_string(),
            endereco_value["cep"].as_str().unwrap_or("").to_string(),
            endereco_value["complemento"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["referencia"]
                .as_str()
                .unwrap_or("")
                .to_string(),
        );
        if endereco.is_err() {
            return Err(endereco.err().unwrap());
        }
        enderecos.push(endereco.unwrap());
    }
    let fornecedor = Fornecedor::new(
        data["nome"].as_str().unwrap_or("").to_string(),
        data["cnpj"].as_str().unwrap_or("").to_string(),
        enderecos,
        data["telefone"].as_str().unwrap_or("").to_string(),
        data["email"].as_str().unwrap_or("").to_string(),
        data["data_criacao"].as_str().unwrap_or("").to_string(),
    );
    if fornecedor.is_err() {
        return Err(fornecedor.err().unwrap());
    }
    let fornecedor = fornecedor.unwrap();

    let fornecedor = fornecedor.create(Privilege::Admin).await;
    if fornecedor.is_err() {
        return Err(fornecedor.err().unwrap());
    }

    Ok("Fornecedor criado com sucesso".to_string())
}
#[tauri::command]
async fn update_fornecedor(data: Value) -> Result<String, String> {
    let fornecedor = Fornecedor::read(data["_id"]["$oid"].as_str().unwrap_or("")).await;   
    if fornecedor.is_err() {
        return Err(fornecedor.err().unwrap());
    }
    let mut fornecedor = fornecedor.unwrap();
    fornecedor.nome = data["nome"].as_str().unwrap_or("").to_string();
    fornecedor.cpf_cnpj = data["cpf_cnpj"].as_str().unwrap_or("").to_string();
    fornecedor.telefone = data["telefone"].as_str().unwrap_or("").to_string();
    fornecedor.email = data["email"].as_str().unwrap_or("").to_string();
    fornecedor.data_criacao = data["data_criacao"].as_str().unwrap_or("").to_string();
    let enderecos_values = data.get("enderecos");
    if enderecos_values.is_none() {
        return Err("Endereços não informados".to_string());
    }
    let enderecos_values = enderecos_values.unwrap().as_array().unwrap();
    let mut enderecos: Vec<Endereco> = Vec::new();
    for endereco_value in enderecos_values {
        let endereco = Endereco::new(
            endereco_value["nome_endereco"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["logradouro"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["numero"].as_i64().unwrap_or(0) as i32,
            endereco_value["bairro"].as_str().unwrap_or("").to_string(),
            endereco_value["cidade"].as_str().unwrap_or("").to_string(),
            endereco_value["estado"].as_str().unwrap_or("").to_string(),
            endereco_value["cep"].as_str().unwrap_or("").to_string(),
            endereco_value["complemento"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            endereco_value["referencia"]
                .as_str()
                .unwrap_or("")
                .to_string(),
        );
        if endereco.is_err() {
            return Err(endereco.err().unwrap());
        }
        enderecos.push(endereco.unwrap());
    }
    fornecedor.enderecos = enderecos;
    let fornecedor = fornecedor.update(Privilege::Admin).await;
    if fornecedor.is_err() {
        return Err(fornecedor.err().unwrap());
    }
    Ok("Fornecedor atualizado com sucesso".to_string())
}
#[tauri::command]
async fn delete_fornecedor(fornecedor_id: &str) -> Result<String, String> {
    let fornecedor = Fornecedor::read(fornecedor_id).await?;
    let fornecedor = fornecedor.delete(Privilege::Admin).await;
    match fornecedor {
        Ok(_) => Ok(format!(
            "Fornecedor {:?} deletado com sucesso",
            fornecedor.unwrap().nome
        )),
        Err(e) => Err(e),
    }
}
#[tauri::command]
async fn create_a_categoria(data: Value) -> Result<String, String> {
    let category = Categoria::new(
        data["nome"].as_str().unwrap_or("").to_string(),
        data["descricao"].as_str().unwrap_or("").to_string(),
    );
    if category.is_err() {
        return Err(category.err().unwrap());
    }
    let category = category.unwrap();
    let category = category.create(Privilege::Admin).await;
    if category.is_err() {
        return Err(category.err().unwrap());
    }
    Ok("Categoria criada com sucesso".to_string())
}
#[tauri::command]
async fn create_a_produto(data: Value) -> Result<String, String> {
    println!("{:?}", data);

    let produto = Produto::new(
        data["nome"].as_str().unwrap_or("").to_string(),
        ObjectId::from_str(data["categoria_id"]["$oid"].as_str().unwrap_or("")).unwrap(),
        data["preco_compra"]
            .as_str()
            .unwrap_or("")
            .parse::<f64>()
            .unwrap(),
        data["preco_venda"]
            .as_str()
            .unwrap_or("")
            .parse::<f64>()
            .unwrap(),
        data["unidade"].as_str().unwrap_or("").to_string(),
   
    );
    if produto.is_err() {
        return Err(produto.err().unwrap());
    }
    let produto = produto.unwrap();
    let produto = produto.create(Privilege::Admin).await;
    if produto.is_err() {
        return Err(produto.err().unwrap());
    }
    Ok("Produto criado com sucesso".to_string())
}
#[tauri::command]
async fn find_cliente_by_substring_name(name_substring: String) -> Result<Vec<Cliente>, String> {
    let clientes =
        Cliente::element_what_contains("nome".to_string(), Bson::String(name_substring)).await;
    if clientes.is_err() {
        return Err(clientes.err().unwrap());
    }
    Ok(clientes.unwrap())
}
#[tauri::command]
async fn find_fornecedor_by_substring_name(
    name_substring: String,
) -> Result<Vec<Fornecedor>, String> {
    let fornecedores =
        Fornecedor::element_what_contains("nome".to_string(), Bson::String(name_substring)).await;
    if fornecedores.is_err() {
        return Err(fornecedores.err().unwrap());
    }

    Ok(fornecedores.unwrap())
}
#[tauri::command]
async fn find_categoria_by_substring_name(name_substring: String) -> Result<Vec<Categoria>, String> {
    let categorias =
        Categoria::element_what_contains("nome".to_string(), Bson::String(name_substring)).await;
    if categorias.is_err() {
        return Err(categorias.err().unwrap());
    }
    Ok(categorias.unwrap())
}
#[tauri::command]
async fn get_categorias() -> Result<Vec<Categoria>, String> {
    let categorias = Categoria::find_all().await;
    if categorias.is_err() {
        return Err(categorias.err().unwrap());
    }
    Ok(categorias.unwrap())
}
#[tauri::command]
async fn find_produto_by_substring_name(name_substring: String) -> Result<Vec<Produto>, String> {
    let produtos =
        Produto::element_what_contains("nome".to_string(), Bson::String(name_substring)).await;
    if produtos.is_err() {
        return Err(produtos.err().unwrap());
    }
    Ok(produtos.unwrap())
}
#[tauri::command]
async fn find_fornecedor_name(fornecedor_id: &str) -> Result<String, String> {
    let fornecedor = Fornecedor::read(fornecedor_id).await;
    if fornecedor.is_err() {
        return Err(fornecedor.err().unwrap());
    }
    Ok(fornecedor.unwrap().nome)
}
#[tauri::command]
async fn find_all_fornecedores() -> Result<Vec<Fornecedor>, String> {
    let fornecedores = Fornecedor::find_all().await;
    if fornecedores.is_err() {
        return Err(fornecedores.err().unwrap());
    }
    Ok(fornecedores.unwrap())
}
#[tauri::command]
async fn movimentacao_entrada(data: Value) -> Result<String, String> {
    let movimentacao = Movimentacao::new(
        ObjectId::from_str(data["produto_id"].as_str().unwrap_or("")).unwrap(),
        TipoMovimentacao::Entrada,
        data["quantidade"].as_f64().unwrap(),
        data["data"].as_str().unwrap().to_string(),
        Some(ObjectId::from_str(data["fornecedor_id"].as_str().unwrap()).unwrap()),
        None,
        Some("Entrada:".to_string()),
    );
    if movimentacao.is_err() {
        return Err(movimentacao.err().unwrap());
    }
    let movimentacao = movimentacao.unwrap();
    let movimentacao = movimentacao.create(Privilege::Admin).await;
    if movimentacao.is_err() {
        return Err(movimentacao.err().unwrap());
    }
    Ok("Movimentação de entrada realizada com sucesso".to_string())
}
#[tauri::command]
async fn movimentacao_saida(data: Value) -> Result<String, String> {
    let movimentacao = Movimentacao::new(
        ObjectId::from_str(data["produto_id"].as_str().unwrap_or("")).unwrap(),
        TipoMovimentacao::Saida,
        data["quantidade"]
            .as_str()
            .unwrap_or("")
            .parse::<f64>()
            .unwrap(),
        data["data"].as_str().unwrap_or("").to_string(),
        None,
        Some(ObjectId::from_str(data["cliente_id"].as_str().unwrap_or("")).unwrap()),
        Some("Saída:".to_string()),
    );
    if movimentacao.is_err() {
        return Err(movimentacao.err().unwrap());
    }
    let movimentacao = movimentacao.unwrap();
    let movimentacao = movimentacao.create(Privilege::Admin).await;
    if movimentacao.is_err() {
        return Err(movimentacao.err().unwrap());
    }
    Ok("Movimentação de saída realizada com sucesso".to_string())
}
#[tauri::command]
async fn create_a_pedido(data: Value) -> Result<String, String> {
    let cliente_id = data["cliente_id"].as_str().unwrap_or("");
    let produto = data["produto"].as_str().unwrap_or("");
    let quantidade = data["quantidade"].as_f64().unwrap();
    let date = data["data"].as_str().unwrap_or("");
    let entrega = data["entrega"].as_str().unwrap_or("");
    let pedido = Pedido::new(
        ObjectId::from_str(cliente_id).unwrap(),
        ObjectId::from_str(produto).unwrap(),
        quantidade,
        date.to_string(),
        Some(entrega.to_string()),
        false,
    );

    if pedido.is_err() {
        return Err(pedido.err().unwrap());
    }
    let pedido = pedido.unwrap();
    let pedido = pedido.create(Privilege::User).await;
    if pedido.is_err() {
        return Err(pedido.err().unwrap());
    }

    let pedido = pedido.unwrap();
    pedido.movimenta_estoque().await.unwrap();
    let pedido_strignified = serde_json::to_string(&pedido).unwrap();
    Ok(pedido_strignified)
}
#[tauri::command]
async fn update_recurrent_orders(data: Value, entrega: Value) -> Result<String, String>{

    /*
    Esta função recebe data, e entrega, data representa algum objeto do tipo RecurrentOrderable, e entrega representa um objeto do tipo Pedido
    ela pegaria todos os pedidos dentro de data e atualiza o campo entrega de cada um deles com o valor de entrega
     */

    let pedidos = data["pedidos"].as_array().unwrap();
    let entrega = entrega["entrega"].as_str().unwrap();
    for pedido in pedidos{
        let pedido_id = pedido["_id"]["$oid"].as_str().unwrap();
        let pedido = Pedido::read(pedido_id).await;
        if pedido.is_err(){
            return Err(pedido.err().unwrap());
        }
        let mut pedido = pedido.unwrap();
        pedido.entrega = Some(entrega.to_string());
        let pedido = pedido.update(Privilege::Admin).await;
        if pedido.is_err(){
            return Err(pedido.err().unwrap());
        }
    }
    Ok("".to_string())
}
#[tauri::command]
async fn update_produto(data: Value) -> Result<String, String> {

    let produto = Produto::read(data["_id"].as_str().unwrap_or("")).await;
    if produto.is_err() {
        return Err(produto.err().unwrap());
    }
    let mut produto = produto.unwrap();
    produto.nome = data["nome"].as_str().unwrap_or("").to_string();
    produto.categoria_id = ObjectId::from_str(data["categoria_id"].as_str().unwrap_or(""))
        .map_err(|e| format!("Invalid ObjectId: {}", e))?;
    produto.preco_compra = data["preco_compra"]
        .as_str()
        .unwrap_or("")
        .parse::<f64>()
        .map_err(|e| format!("Invalid preco_compra: {}", e))?;
    produto.preco_venda = data["preco_venda"]
        .as_str()
        .unwrap_or("")
        .parse::<f64>()
        .map_err(|e| format!("Invalid preco_venda: {}", e))?;
    let produto = produto.update(Privilege::Admin).await;
    if produto.is_err() {
        return Err(produto.err().unwrap());
    }
    Ok("Produto atualizado com sucesso".to_string())
}
#[tauri::command]
async fn get_all_recurrent_orders_on_day(day: String) -> Result<Vec<Value>, String> {
    let day = DateTime::parse_rfc3339_str(std::str::from_utf8(day.as_bytes()).unwrap()).unwrap();
    let pedidos_semanais = PedidosSemanais::get_all_recurrent_orders_on_day(day).await;
    let mut pedidos = Vec::new();
    if pedidos_semanais.is_err() {
    } else {
        pedidos.push(serde_json::to_value(pedidos_semanais.unwrap()).unwrap());
    }

    let pedidos_mensais = PedidosMensais::get_all_recurrent_orders_on_day(day).await;
    if pedidos_mensais.is_err() {
    } else {
        pedidos.push(serde_json::to_value(pedidos_mensais.unwrap()).unwrap());
    }
    let pedidos_por_intervalo = PedidosPorIntervalo::get_all_recurrent_orders_on_day(day).await;
    if pedidos_por_intervalo.is_err() {
    } else {
        pedidos.push(serde_json::to_value(pedidos_por_intervalo.unwrap()).unwrap());
    }
    let pedidos_semanais_mensais =
        PedidosSemanaisMensais::get_all_recurrent_orders_on_day(day).await;
    if pedidos_semanais_mensais.is_err() {
    } else {
        pedidos.push(serde_json::to_value(pedidos_semanais_mensais.unwrap()).unwrap());
    }

    Ok(pedidos)
}
#[tauri::command]
async fn get_all_produtos() -> Result<Value, String> {
    let produtos = Produto::find_all().await;
    if produtos.is_err() {
        return Err(produtos.err().unwrap());
    }
    Ok(serde_json::to_value(produtos.unwrap()).unwrap())
}
#[tauri::command]
async fn get_cliente_by_id(cliente_id: &str) -> Result<Cliente, String> {
    let cliente = Cliente::read(cliente_id).await;
    if cliente.is_err() {
        return Err(cliente.err().unwrap());
    }
    Ok(cliente.unwrap())
}
#[tauri::command]
async fn edit_produto(data: Value) -> Result<String, String> {
    println!("{:?}", data);

    let produto = Produto::read(data["_id"]["$oid"].as_str().unwrap_or("")).await;
    if produto.is_err() {
        return Err(produto.err().unwrap());
    }

    let mut produto = produto.unwrap();
    produto.nome = data["nome"].as_str().unwrap_or("").to_string();
    produto.categoria_id =
        ObjectId::from_str(data["categoria_id"]["$oid"].as_str().unwrap_or("")).unwrap();
    produto.preco_compra = data["preco_compra"].as_f64().unwrap();
    produto.preco_venda = data["preco_venda"].as_f64().unwrap();

    let _produto = produto.update(Privilege::Admin).await;

    return Ok("Produto editado com sucesso".to_string());
}
#[tauri::command]
async fn save_pedido_recorrente(data: Value) -> Result<String, String>{
    //data = Object {"cliente_id": String("67451ffca110d98574d58841"), "pedidos": Array [Object {"produto": String("67451b99a110d98574d58815"), "quantidade": Number(200), "data": String("2024-12-01"), "entrega": String(""), "executado": Bool(false)}], "recorrencia": Object {"value": String("semanal"), "weekDay": Array [Number(1)], "monthDay": Array [], "interval": Array [], "weekMonth": Array []}}
    let cliente_id = data["cliente_id"].as_str().unwrap_or("");
    let pedidos = data["pedidos"].as_array().unwrap();
    let recorrencia = data["recorrencia"].as_object().unwrap();
    let recorrencia_value = recorrencia["value"].as_str().unwrap_or("");
    let date = pedidos[0]["data"].as_str().unwrap_or("");


    match recorrencia_value {
        "semanal" => {
            let week_day = recorrencia["weekDay"].as_array().unwrap();
            let mut week_day_vec = Vec::new();
            for day in week_day {
                week_day_vec.push(day.as_i64().unwrap() as u8);
            }
            let pedidos_vec: Vec<Pedido> = pedidos.iter().map(|pedido| {
                Pedido::new(
                    ObjectId::from_str(cliente_id).unwrap(),
                    ObjectId::from_str(pedido["produto"].as_str().unwrap_or("")).unwrap(),
                    pedido["quantidade"].as_f64().unwrap(),
                    pedido["data"].as_str().unwrap_or("").to_string(),
                    Some(pedido["entrega"].as_str().unwrap_or("").to_string()),
                    pedido["executado"].as_bool().unwrap_or(false),
                ).unwrap()
            }).collect();
            let pedidos_semanais = PedidosSemanais::new(date.to_string(), week_day_vec, Some(pedidos_vec));
            let pedidos_semanais = pedidos_semanais.create(Privilege::Admin).await;
            if pedidos_semanais.is_err() {
                return Err(pedidos_semanais.err().unwrap());
            }

        }
        "mensal" => {
            let month_day = recorrencia["monthDay"].as_array().unwrap();
            let mut month_day_vec = Vec::new();
            for day in month_day {
                month_day_vec.push(day.as_i64().unwrap() as u8);
            }
            let pedidos_vec: Vec<Pedido> = pedidos.iter().map(|pedido| {
                Pedido::new(
                    ObjectId::from_str(pedido["produto"].as_str().unwrap_or("")).unwrap(),
                    ObjectId::from_str(cliente_id).unwrap(),
                    pedido["quantidade"].as_f64().unwrap(),
                    pedido["data"].as_str().unwrap_or("").to_string(),
                    Some(pedido["entrega"].as_str().unwrap_or("").to_string()),
                    pedido["executado"].as_bool().unwrap_or(false),
                ).unwrap()
            }).collect();
            let pedidos_mensais = PedidosMensais::new(date.to_string(), month_day_vec, Some(pedidos_vec));
            let pedidos_mensais = pedidos_mensais.create(Privilege::Admin).await;
            if pedidos_mensais.is_err() {
                return Err(pedidos_mensais.err().unwrap());
            }
        }
        "intervalo" => {
            let interval = recorrencia["interval"].as_array().unwrap();
            let mut interval_vec = Vec::new();
            for day in interval {
                interval_vec.push(day.as_i64().unwrap() as u8);
            }
            let pedidos_vec: Vec<Pedido> = pedidos.iter().map(|pedido| {
                Pedido::new(
                    ObjectId::from_str(pedido["produto"].as_str().unwrap_or("")).unwrap(),
                    ObjectId::from_str(cliente_id).unwrap(),
                    pedido["quantidade"].as_f64().unwrap(),
                    pedido["data"].as_str().unwrap_or("").to_string(),
                    Some(pedido["entrega"].as_str().unwrap_or("").to_string()),
                    pedido["executado"].as_bool().unwrap_or(false),
                ).unwrap()
            }).collect();
            let pedidos_por_intervalo = PedidosPorIntervalo::new(date.to_string(), interval_vec, Some(pedidos_vec));
            let pedidos_por_intervalo = pedidos_por_intervalo.create(Privilege::Admin).await;
            if pedidos_por_intervalo.is_err() {
                return Err(pedidos_por_intervalo.err().unwrap());
            }
        }
        "semanal_mensal" => {
            let week_month = recorrencia["weekMonth"].as_array().unwrap();
            let mut week_month_vec = Vec::new();
            for day in week_month {
                week_month_vec.push(day.as_i64().unwrap() as u8);
            }
            let pedidos_vec: Vec<Pedido> = pedidos.iter().map(|pedido| {
                Pedido::new(
                    ObjectId::from_str(pedido["produto"].as_str().unwrap_or("")).unwrap(),
                    ObjectId::from_str(cliente_id).unwrap(),
                    pedido["quantidade"].as_f64().unwrap(),
                    pedido["data"].as_str().unwrap_or("").to_string(),
                    Some(pedido["entrega"].as_str().unwrap_or("").to_string()),
                    pedido["executado"].as_bool().unwrap_or(false),
                ).unwrap()
            }).collect();
            let pedidos_semanais_mensais = PedidosSemanaisMensais::new(date.to_string(), week_month_vec, Some(pedidos_vec));
            let pedidos_semanais_mensais = pedidos_semanais_mensais.create(Privilege::Admin).await;
            if pedidos_semanais_mensais.is_err() {
                return Err(pedidos_semanais_mensais.err().unwrap());
            }
        }

       _ => {
            return Err("Recorrencia não informada".to_string());
        }
        
    }


    Ok("Pedido recorrente criado com sucesso".to_string())
}
#[tauri::command]
async fn filter_produtos_by_category(category_id: &str) -> Result<Vec<Produto>, String> {
    let produtos = Produto::find_all().await;
    if produtos.is_err() {
        return Err(produtos.err().unwrap());
    }
    let produtos = produtos.unwrap();
    let produtos = produtos
        .into_iter()
        .filter(|produto| produto.categoria_id.to_hex() == category_id)
        .collect();
    Ok(produtos)
}
fn main() {
    block_on(async {
        let result = create_a_admin_if_dont_exists().await;
        match result {
            Ok(result) => println!("{}", result),
            Err(e) => println!("{}", e),
        }
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_a_cliente,
            create_a_fornecedor,
            create_a_categoria,
            create_a_produto,
            create_a_pedido,
            delete_cliente,
            delete_fornecedor,
            edit_produto,
            filter_produtos_by_category,
            find_all_fornecedores,
            find_categoria_by_substring_name,
            find_cliente_by_substring_name,
            find_fornecedor_name,
            find_fornecedor_by_substring_name,
            find_produto_by_substring_name,
            get_all_recurrent_orders_on_day,
            get_all_produtos,
            get_categorias,
            get_cliente_by_id,
    
            login,
            movimentacao_entrada,
            movimentacao_saida,
            update_cliente,
            update_fornecedor,
            update_produto,
            save_pedido_recorrente,
            update_recurrent_orders
            
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
