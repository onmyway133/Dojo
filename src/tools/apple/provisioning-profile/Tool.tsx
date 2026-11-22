import { json } from "@codemirror/lang-json";
import { useState } from "react";
import {
  CodeEditor,
  CopyButton,
  FileDropZone,
  ResultList,
  ResultRow,
  StatusMessage,
  ToolPage,
  ToolSection,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/hooks/useAsync";
import { fileName } from "@/lib/files";
import { entitlementNotes, expiryStatus } from "./logic";
import { decodeProfileFile, type ProfileInfo } from "./api";

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const formatDate = (seconds?: number) => (seconds === undefined ? "" : dateTime.format(seconds * 1000));
const jsonLanguage = json();
const filters = [{ name: "Provisioning Profiles", extensions: ["mobileprovision", "provisionprofile"] }];

function ValidityBadge({ seconds }: { seconds?: number }) {
  const status = expiryStatus(seconds);
  if (!status) return null;
  return <Badge variant={status.tone === "ok" ? "secondary" : status.tone === "error" ? "destructive" : "default"}>{status.label}</Badge>;
}

function Summary({ profile, file }: { profile: ProfileInfo; file: string }) {
  return (
    <ToolSection
      title={profile.name ?? file}
      meta={
        <span className="flex items-center gap-1.5">
          <Badge variant="secondary">{profile.kind}</Badge>
          <ValidityBadge seconds={profile.expirationDate} />
        </span>
      }
    >
      <ResultList>
        <ResultRow label="Bundle ID" value={profile.bundleId ?? ""} mono />
        <ResultRow label="App ID" value={profile.applicationIdentifier ?? ""} mono />
        <ResultRow label="App ID name" value={profile.appIdName ?? ""} />
        <ResultRow label="Team" value={[profile.teamName, profile.teamIds.join(", ")].filter(Boolean).join(" · ")} />
        <ResultRow label="Platforms" value={profile.platforms.join(", ")} />
        <ResultRow label="Created" value={formatDate(profile.creationDate)} />
        <ResultRow label="Expires" value={formatDate(profile.expirationDate)} />
        <ResultRow label="UUID" value={profile.uuid ?? ""} mono />
        <ResultRow label="Xcode managed" value={profile.xcodeManaged ? "Yes" : "No"} />
      </ResultList>
    </ToolSection>
  );
}

function Entitlements({ entitlements }: { entitlements: Record<string, unknown> }) {
  const text = JSON.stringify(entitlements, null, 2);
  const notes = entitlementNotes(entitlements);
  return (
    <ToolSection title="Entitlements" meta={`${Object.keys(entitlements).length} keys`} actions={<CopyButton value={text} />}>
      {notes.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1 text-[13px] text-muted-foreground">
          {notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      )}
      <div className="overflow-hidden rounded-lg">
        <CodeEditor value={text} language={jsonLanguage} readOnly lineNumbers={false} />
      </div>
    </ToolSection>
  );
}

function Devices({ profile }: { profile: ProfileInfo }) {
  if (profile.provisionsAllDevices) {
    return (
      <ToolSection title="Devices">
        <p className="text-[13px] text-muted-foreground">Runs on all devices (ProvisionsAllDevices).</p>
      </ToolSection>
    );
  }
  if (profile.devices.length === 0) {
    return (
      <ToolSection title="Devices">
        <p className="text-[13px] text-muted-foreground">No devices listed. App Store profiles don't include devices.</p>
      </ToolSection>
    );
  }
  return (
    <ToolSection title="Devices" meta={`${profile.devices.length}`} actions={<CopyButton value={profile.devices.join("\n")} />}>
      <ResultList>
        {profile.devices.map((udid, i) => (
          <ResultRow key={udid} label={i + 1} value={udid} mono compact />
        ))}
      </ResultList>
    </ToolSection>
  );
}

function Certificates({ profile }: { profile: ProfileInfo }) {
  return (
    <ToolSection title="Certificates" meta={`${profile.certificates.length}`}>
      {profile.certificates.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No developer certificates.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {profile.certificates.map((cert) => (
            <ResultList key={cert.sha1}>
              <ResultRow label="Subject" value={cert.subject} display={<span className="flex items-center gap-2">{/CN=([^,]+)/.exec(cert.subject)?.[1] ?? cert.subject} <ValidityBadge seconds={cert.notAfter} /></span>} />
              <ResultRow label="Expires" value={formatDate(cert.notAfter)} />
              <ResultRow label="SHA-1" value={cert.sha1} mono />
            </ResultList>
          ))}
        </div>
      )}
    </ToolSection>
  );
}

export default function ProvisioningProfileTool() {
  const [path, setPath] = useState<string>();
  const profile = useAsync(() => (path ? decodeProfileFile(path) : undefined), [path]);
  const file = path ? fileName(path) : "";

  return (
    <ToolPage layout="scroll">
      <FileDropZone
        onFile={setPath}
        filters={filters}
        title={path ? file : "Drop a provisioning profile or click to choose"}
        subtitle="~/Library/Developer/Xcode/UserData/Provisioning Profiles, or inside an .app at embedded.mobileprovision"
      />
      {profile.status === "error" && <StatusMessage tone="error">{profile.error}</StatusMessage>}
      {profile.status === "success" && (
        <>
          <Summary profile={profile.value} file={file} />
          <Entitlements entitlements={profile.value.entitlements} />
          <Devices profile={profile.value} />
          <Certificates profile={profile.value} />
          <ToolSection title="Full profile" actions={<CopyButton value={JSON.stringify(profile.value.raw, null, 2)} />}>
            <div className="max-h-96 overflow-auto rounded-lg">
              <CodeEditor value={JSON.stringify(profile.value.raw, null, 2)} language={jsonLanguage} readOnly lineNumbers={false} />
            </div>
          </ToolSection>
        </>
      )}
    </ToolPage>
  );
}
