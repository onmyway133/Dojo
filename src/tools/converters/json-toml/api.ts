import { call } from "@/lib/invoke";

export const jsonToToml = (input: string) => call<string>("json_to_toml", { input });
export const tomlToJson = (input: string, indent: number) => call<string>("toml_to_json", { input, indent });
