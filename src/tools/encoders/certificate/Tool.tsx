import { formatDistanceStrict } from "date-fns";
import {
  CodeEditor,
  InputActions,
  OpenTextFileButton,
  ResultList,
  ResultRow,
  SplitView,
  StatusMessage,
  ToolPage,
  ToolSection,
  usePersistentState,
} from "@/components/tool";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/hooks/useAsync";
import { useDebounced } from "@/hooks/useDebounced";
import { type CertificateInfo, commonName, parseCertificates } from "./api";

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function validity(cert: CertificateInfo) {
  const now = Date.now() / 1000;
  if (now < cert.notBefore) return { label: "Not yet valid", variant: "destructive" as const };
  if (now > cert.notAfter) return { label: "Expired", variant: "destructive" as const };
  return { label: `Valid, expires ${formatDistanceStrict(cert.notAfter * 1000, Date.now(), { addSuffix: true })}`, variant: "secondary" as const };
}

function CertificateCard({ cert, index }: { cert: CertificateInfo; index: number }) {
  const status = validity(cert);
  return (
    <ToolSection
      title={commonName(cert.subject)}
      meta={
        <span className="flex items-center gap-1.5">
          {index === 0 ? "Leaf" : `Chain #${index + 1}`}
          {cert.isCa && <Badge variant="secondary">CA</Badge>}
          <Badge variant={status.variant}>{status.label}</Badge>
        </span>
      }
      className="shrink-0"
    >
      <ResultList>
        <ResultRow label="Subject" value={cert.subject} />
        <ResultRow label="Issuer" value={cert.issuer} />
        <ResultRow label="Valid from" value={dateTime.format(cert.notBefore * 1000)} />
        <ResultRow label="Valid until" value={dateTime.format(cert.notAfter * 1000)} />
        <ResultRow label="Alt names" value={cert.subjectAltNames.join("\n")} />
        <ResultRow label="Public key" value={cert.publicKey} />
        <ResultRow label="Signature" value={cert.signatureAlgorithm} />
        <ResultRow label="Serial" value={cert.serial} mono />
        <ResultRow label="SHA-256" value={cert.sha256} mono />
        <ResultRow label="SHA-1" value={cert.sha1} mono />
        <ResultRow label="Version" value={`v${cert.version}`} />
      </ResultList>
    </ToolSection>
  );
}

export default function CertificateTool() {
  const [pem, setPem] = usePersistentState("pem", "");
  const debounced = useDebounced(pem, 200);
  const certs = useAsync(() => (debounced.trim() ? parseCertificates(debounced) : undefined), [debounced]);

  return (
    <ToolPage>
      <SplitView>
        <ToolSection
          title="PEM"
          actions={
            <>
              <OpenTextFileButton onOpen={setPem} accept=".pem,.crt,.cer,.txt" />
              <InputActions value={pem} onChange={setPem} />
            </>
          }
          fill
          padded={false}
        >
          <CodeEditor value={pem} onChange={setPem} lineNumbers={false} placeholder="-----BEGIN CERTIFICATE-----" />
        </ToolSection>
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          {certs.status === "idle" && (
            <ToolSection title="Details">
              <p className="text-[13px] text-muted-foreground">
                Paste a certificate or a full chain. Get one with
                <code className="mx-1 rounded bg-field px-1 font-mono text-[12px]">openssl s_client -showcerts -connect host:443</code>
              </p>
            </ToolSection>
          )}
          {certs.status === "error" && <StatusMessage tone="error">{certs.error}</StatusMessage>}
          {certs.status === "success" && certs.value.map((cert, i) => <CertificateCard key={cert.sha256} cert={cert} index={i} />)}
        </div>
      </SplitView>
    </ToolPage>
  );
}
