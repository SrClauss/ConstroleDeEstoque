use chrono::{Datelike, NaiveDate};
use mongodb::bson::DateTime;
use regex::Regex;

pub fn bson_date_equal(data1: &DateTime, data2: &DateTime) -> bool {
    let data1 = NaiveDate::parse_from_str(&data1.to_string()[0..10], "%Y-%m-%d").unwrap();
    let data2 = NaiveDate::parse_from_str(&data2.to_string()[0..10], "%Y-%m-%d").unwrap();
    data1 == data2
}

pub fn bson_to_naive(data: DateTime) -> NaiveDate {
    NaiveDate::parse_from_str(&data.to_string()[0..10], "%Y-%m-%d").unwrap()
}

pub fn naive_to_bson(date: NaiveDate) -> DateTime {
    let date = date.to_string() + "T00:00:00.000Z";
    let date = DateTime::parse_rfc3339_str(&date).unwrap();
    date
}
pub fn validar_cep(cep: &str) -> bool {
    cep.len() == 8
}
pub fn validar_cpf_cnpj(cpf_cnpj: &str) -> bool {
    validar_cpf(cpf_cnpj) || validar_cnpj(cpf_cnpj)
}
pub fn validar_cpf(cpf: &str) -> bool {
    let re = Regex::new(r"^\d{3}\.\d{3}\.\d{3}-\d{2}$").unwrap();
    if !re.is_match(cpf) {
        return false;
    }

    let nums: Vec<u32> = cpf.chars().filter_map(|c| c.to_digit(10)).collect();
    if nums.len() != 11 {
        return false;
    }

    let dv1 = (0..9).map(|i| nums[i] * (10 - i as u32)).sum::<u32>() % 11;
    let dv1 = if dv1 < 2 { 0 } else { 11 - dv1 };

    let dv2 = (0..10).map(|i| nums[i] * (11 - i as u32)).sum::<u32>() % 11;
    let dv2 = if dv2 < 2 { 0 } else { 11 - dv2 };

    dv1 == nums[9] && dv2 == nums[10]
}

pub fn dia_mes(date: DateTime) -> u8 {
    let date = bson_to_naive(date);
    date.day() as u8
}

pub fn dia_semana_mes(date: DateTime) -> Result<u8, String> {
    let date = bson_to_naive(date);

    if date.day0() as u8 >= 28 {
        return Err("Dia inválido".to_string());
    }
    let mut mondays: Vec<u8> = Vec::new();
    let mut tuesdays: Vec<u8> = Vec::new();
    let mut wednesdays: Vec<u8> = Vec::new();
    let mut thursdays: Vec<u8> = Vec::new();
    let mut fridays: Vec<u8> = Vec::new();
    let mut saturdays: Vec<u8> = Vec::new();
    let mut sundays: Vec<u8> = Vec::new();

    for i in 1 as u8..=28 as u8 {
        let d = NaiveDate::from_ymd_opt(date.year(), date.month0() + 1, i as u32);
        let weekday = d.unwrap().weekday().num_days_from_monday() as u8;
        match weekday {
            0 => mondays.push(i),
            1 => tuesdays.push(i),
            2 => wednesdays.push(i),
            3 => thursdays.push(i),
            4 => fridays.push(i),
            5 => saturdays.push(i),
            6 => sundays.push(i),
            _ => (),
        }
    }

    let weekday = date.weekday().num_days_from_monday() as u8;
    let day = date.day() as u8;
 
    match weekday {
        0 => {
            let result = mondays.iter().position(|&x| x == day);
            if result.is_none() {
                return Err(format!(
                    "Dia {} não encontrado em mondays {:?}",
                    day, mondays
                ));
            }
            let position = (result.unwrap() + 1) as u8 * 10;
            return Ok(position + 2);
        }
        1 => {
            let result = tuesdays.iter().position(|&x| x == day);
            if result.is_none() {
                return Err(format!(
                    "Dia {} não encontrado em tuesdays {:?}",
                    day, tuesdays
                ));
            }
            let position = (result.unwrap() + 1) as u8 * 10;
            return Ok(position + 3);
        }
        2 => {
            let result = wednesdays.iter().position(|&x| x == day);
            if result.is_none() {
                return Err(format!(
                    "Dia {} não encontrado em wednesdays {:?}",
                    day, wednesdays
                ));
            }
            let position = (result.unwrap() + 1) as u8 * 10;
            return Ok(position + 4);
        }
        3 => {
            let result = thursdays.iter().position(|&x| x == day);
            if result.is_none() {
                return Err(format!(
                    "Dia {} não encontrado em thursdays {:?}",
                    day, thursdays
                ));
            }
            let position = (result.unwrap() + 1) as u8 * 10;
            return Ok(position + 5);
        }
        4 => {
            let result = fridays.iter().position(|&x| x == day);
            if result.is_none() {
                return Err(format!(
                    "Dia {} não encontrado em fridays {:?}",
                    day, fridays
                ));
            }
            let position = (result.unwrap() + 1) as u8 * 10;
            return Ok(position + 6);
        }
        5 => {
            let result = saturdays.iter().position(|&x| x == day);

       
            if result.is_none() {
                return Err(format!(
                    "Dia {} não encontrado em saturdays {:?}",
                    day, saturdays
                ));
            }
            let position = (result.unwrap() + 1) as u8 * 10;
            return Ok(position + 7);
        }
        6 => {
            let result = sundays.iter().position(|&x| x == day);
            if result.is_none() {
                return Err(format!(
                    "Dia {} não encontrado em sundays {:?}",
                    day, sundays
                ));
            }
            let position = (result.unwrap() + 1) as u8 * 10;
            return Ok(position + 1);
        }

        _ => return Err("Dia inválido".to_string()),
    }
}

pub fn validar_cnpj(cnpj: &str) -> bool {
    let re = Regex::new(r"^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$").unwrap();
    if !re.is_match(cnpj) {
        return false;
    }

    let nums: Vec<u32> = cnpj.chars().filter_map(|c| c.to_digit(10)).collect();
    if nums.len() != 14 {
        return false;
    }

    let dv1 = (0..12)
        .map(|i| nums[i] * (if i % 8 == 0 { 2 } else { 9 - (i % 8) as u32 }))
        .sum::<u32>()
        % 11;
    let dv1 = if dv1 < 2 { 0 } else { 11 - dv1 };

    let dv2 = (0..13)
        .map(|i| nums[i] * (if i % 8 == 0 { 2 } else { 9 - (i % 8) as u32 }))
        .sum::<u32>()
        % 11;
    let dv2 = if dv2 < 2 { 0 } else { 11 - dv2 };

    dv1 == nums[12] && dv2 == nums[13]
}

pub fn naive_to_ymd(data: NaiveDate) -> NaiveDate {
    NaiveDate::from_ymd_opt(data.year(), data.month0(), data.day0()).unwrap()
}

pub fn weekday(date: DateTime) -> u8 {
    let wekday_naive = bson_to_naive(date).weekday().num_days_from_monday() as u8;
    match wekday_naive {
        0 => 2,
        1 => 3,
        2 => 4,
        3 => 5,
        4 => 6,
        5 => 7,
        6 => 1,
        _ => 0,
    }
}
pub fn compare_strings(criterio: &str, chave: &str) -> bool {
    let without_acents_a = criterio
        .chars()
        .map(|c| match c {
            'á' => 'a',
            'à' => 'a',
            'ã' => 'a',
            'â' => 'a',
            'é' => 'e',
            'ê' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ô' => 'o',
            'õ' => 'o',
            'ú' => 'u',
            'ç' => 'c',
            _ => c,
        })
        .collect::<String>();

    let without_acents_b = chave
        .chars()
        .map(|c| match c {
            'á' => 'a',
            'à' => 'a',
            'ã' => 'a',
            'â' => 'a',
            'é' => 'e',
            'ê' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ô' => 'o',
            'õ' => 'o',
            'ú' => 'u',
            'ç' => 'c',
            _ => c,
        })
        .collect::<String>();

    without_acents_a
        .to_lowercase()
        .contains(&without_acents_b.to_lowercase())
}

#[cfg(test)]

mod tests {
    use super::*;
    #[test]
    fn test_compare_strings() {
        assert_eq!(compare_strings("a", "a"), true);
        assert_eq!(compare_strings("a", "A"), true);
        assert_eq!(compare_strings("abaccate", "áb"), true);
        assert_eq!(compare_strings("a", "b"), false);
    }
    #[test]
    fn test_naive_to_bson() {
        let date = NaiveDate::parse_from_str("07/01/2024", "%d/%m/%Y").unwrap();
        let date = naive_to_bson(date);

        assert_eq!(date.to_string(), "2024-01-07 0:00:00.0 +00:00:00");
    }

    #[test]
    fn test_dia_semana_mes() {
        let date = NaiveDate::parse_from_str("07/01/2024", "%d/%m/%Y").unwrap();
        let date = naive_to_bson(date);
        let date = dia_semana_mes(date).unwrap();
        assert_eq!(date, 11);


        let date = NaiveDate::parse_from_str("01/01/2024", "%d/%m/%Y").unwrap();
        let date = naive_to_bson(date);
        let date = dia_semana_mes(date).unwrap();
        assert_eq!(date, 12);
        
        let date = NaiveDate::parse_from_str("26/01/2024", "%d/%m/%Y").unwrap();
        let date = naive_to_bson(date);
        let date = dia_semana_mes(date).unwrap();
        assert_eq!(date, 46);
    }
}
