import { sql } from "@codemirror/lang-sql";
import { useCallback } from "react";
import { format, type KeywordCase, type SqlLanguage } from "sql-formatter";
import {
  type Choice,
  Option,
  OptionSelect,
  Segmented,
  ToolOptions,
  TransformTool,
  usePersistentState,
} from "@/components/tool";
import { indentChoices, type Indent } from "@/tools/shared/indent";

const language = sql();

const dialects: Choice<SqlLanguage>[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "transactsql", label: "SQL Server" },
  { value: "plsql", label: "Oracle PL/SQL" },
  { value: "bigquery", label: "BigQuery" },
  { value: "snowflake", label: "Snowflake" },
  { value: "redshift", label: "Redshift" },
  { value: "spark", label: "Spark" },
  { value: "duckdb", label: "DuckDB" },
];

const caseChoices: Choice<KeywordCase>[] = [
  { value: "preserve", label: "Preserve" },
  { value: "upper", label: "UPPER" },
  { value: "lower", label: "lower" },
];

const sample =
  "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.created_at > '2026-01-01' and u.active = true group by u.id, u.name having count(o.id) > 3 order by orders desc limit 20;";

export default function SqlFormatterTool() {
  const [dialect, setDialect] = usePersistentState<SqlLanguage>("dialect", "sql");
  const [keywordCase, setKeywordCase] = usePersistentState<KeywordCase>("keywordCase", "upper");
  const [indent, setIndent] = usePersistentState<Indent>("indent", "2");

  const transform = useCallback(
    (input: string) =>
      format(input, {
        language: dialect,
        keywordCase,
        useTabs: indent === "tab",
        tabWidth: indent === "tab" ? 4 : Number(indent),
      }),
    [dialect, keywordCase, indent],
  );

  return (
    <TransformTool
      transform={transform}
      inputLanguage={language}
      sample={sample}
      placeholder="Paste a SQL query"
      options={
        <ToolOptions>
          <Option label="Dialect">
            <OptionSelect value={dialect} onChange={setDialect} choices={dialects} />
          </Option>
          <Option label="Keywords">
            <Segmented value={keywordCase} onChange={setKeywordCase} choices={caseChoices} />
          </Option>
          <Option label="Indent">
            <Segmented value={indent} onChange={setIndent} choices={indentChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
