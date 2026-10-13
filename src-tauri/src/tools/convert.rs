use serde_json::Value as Json;
use toml::Value as Toml;

use crate::error::{AppError, AppResult};

pub fn json_to_toml(input: &str) -> AppResult<String> {
    let json: Json = serde_json::from_str(input).map_err(|e| AppError::invalid(format!("Invalid JSON: {e}")))?;
    let Json::Object(_) = json else {
        return Err(AppError::invalid("TOML needs a JSON object at the top level"));
    };
    let toml = json_value_to_toml(json)?;
    toml::to_string_pretty(&toml).map_err(|e| AppError::invalid(e.to_string()))
}

pub fn toml_to_json(input: &str, indent: usize) -> AppResult<String> {
    let table: toml::Table = input.parse().map_err(|e: toml::de::Error| AppError::invalid(e.to_string()))?;
    let json = toml_value_to_json(Toml::Table(table));
    pretty_json(&json, indent)
}

fn json_value_to_toml(value: Json) -> AppResult<Toml> {
    Ok(match value {
        Json::Null => return Err(AppError::invalid("TOML has no null; remove or replace null values")),
        Json::Bool(b) => Toml::Boolean(b),
        Json::Number(n) => match n.as_i64() {
            Some(i) => Toml::Integer(i),
            None => Toml::Float(n.as_f64().unwrap_or(f64::NAN)),
        },
        Json::String(s) => Toml::String(s),
        Json::Array(items) => Toml::Array(items.into_iter().map(json_value_to_toml).collect::<AppResult<_>>()?),
        Json::Object(map) => Toml::Table(
            map.into_iter()
                .map(|(k, v)| Ok((k, json_value_to_toml(v)?)))
                .collect::<AppResult<_>>()?,
        ),
    })
}

/// Dates become their TOML text so they survive as readable JSON strings.
fn toml_value_to_json(value: Toml) -> Json {
    match value {
        Toml::String(s) => Json::String(s),
        Toml::Integer(i) => Json::from(i),
        Toml::Float(f) => serde_json::Number::from_f64(f).map_or(Json::Null, Json::Number),
        Toml::Boolean(b) => Json::Bool(b),
        Toml::Datetime(d) => Json::String(d.to_string()),
        Toml::Array(items) => Json::Array(items.into_iter().map(toml_value_to_json).collect()),
        Toml::Table(table) => Json::Object(table.into_iter().map(|(k, v)| (k, toml_value_to_json(v))).collect()),
    }
}

fn pretty_json(value: &Json, indent: usize) -> AppResult<String> {
    let indent = " ".repeat(indent);
    let formatter = serde_json::ser::PrettyFormatter::with_indent(indent.as_bytes());
    let mut out = Vec::new();
    let mut serializer = serde_json::Serializer::with_formatter(&mut out, formatter);
    serde::Serialize::serialize(value, &mut serializer).map_err(|e| AppError::invalid(e.to_string()))?;
    String::from_utf8(out).map_err(|e| AppError::invalid(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_round_trip_keeps_order() {
        let toml = json_to_toml(r#"{"name":"app","version":2,"deps":{"serde":"1"}}"#).unwrap();
        assert_eq!(toml, "name = \"app\"\nversion = 2\n\n[deps]\nserde = \"1\"\n");
        let json = toml_to_json(&toml, 2).unwrap();
        assert_eq!(json, "{\n  \"name\": \"app\",\n  \"version\": 2,\n  \"deps\": {\n    \"serde\": \"1\"\n  }\n}");
    }

    #[test]
    fn rejects_null_and_non_objects() {
        assert!(json_to_toml("[1,2]").is_err());
        assert!(json_to_toml(r#"{"a":null}"#).is_err());
    }

    #[test]
    fn dates_become_strings() {
        let json = toml_to_json("when = 1979-05-27T07:32:00Z", 2).unwrap();
        assert!(json.contains("\"1979-05-27T07:32:00Z\""));
    }
}
