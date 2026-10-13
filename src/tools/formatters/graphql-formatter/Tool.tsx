import { useCallback } from "react";
import { Option, Segmented, ToolOptions, TransformTool, usePersistentState } from "@/components/tool";
import { indentChoices, prettierIndent, type Indent } from "@/tools/shared/indent";
import { prettierFormat } from "@/tools/shared/prettier";

const sample = `query Repo($owner:String!,$name:String!){repository(owner:$owner,name:$name){id name stargazerCount issues(first:5,states:OPEN){nodes{number title author{login}}}}}`;

export default function GraphqlFormatterTool() {
  const [indent, setIndent] = usePersistentState<Indent>("indent", "2");
  const transform = useCallback((input: string) => prettierFormat(input, "graphql", prettierIndent(indent)), [indent]);

  return (
    <TransformTool
      transform={transform}
      sample={sample}
      placeholder="Paste a GraphQL query or schema"
      options={
        <ToolOptions>
          <Option label="Indent">
            <Segmented value={indent} onChange={setIndent} choices={indentChoices} />
          </Option>
        </ToolOptions>
      }
    />
  );
}
