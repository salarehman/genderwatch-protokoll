import { useState, useEffect } from "react";
import { styled, Button, InputText } from "@washingtonpost/wpds-ui-kit";
import { supabase, Protocol } from "../lib/supabase";

const Wrapper = styled("div", {
  minHeight: "100vh",
  backgroundColor: "$background",
  padding: "$200 $150",
  "@sm": { padding: "$100 $075" },
});

const Header = styled("div", {
  marginBottom: "$200",
  borderBottom: "1px solid $outline",
  paddingBottom: "$150",
});

const Title = styled("h1", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$200",
  lineHeight: "$headline",
  color: "$primary",
  marginBottom: "$050",
});

const Subtitle = styled("p", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
});

const NewProtocolCard = styled("div", {
  backgroundColor: "$surface",
  borderRadius: "$050",
  padding: "$150",
  marginBottom: "$200",
  boxShadow: "$200",
  display: "flex",
  gap: "$100",
  alignItems: "flex-end",
  flexWrap: "wrap",
});

const ProtocolList = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$100",
});

const ProtocolRow = styled("div", {
  backgroundColor: "$surface",
  borderRadius: "$050",
  padding: "$100 $150",
  boxShadow: "$100",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  transition: "box-shadow 120ms ease",
  "@hover": {
    "&:hover": {
      boxShadow: "$300",
    },
  },
});

const ProtocolName = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$100",
  color: "$primary",
});

const ProtocolDate = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
});

const EmptyState = styled("p", {
  fontFamily: "$meta",
  color: "$onBackground-subtle",
  textAlign: "center",
  padding: "$200",
  fontSize: "$087",
});

const SectionTitle = styled("h2", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$112",
  color: "$primary",
  marginBottom: "$100",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

interface HomePageProps {
  onSelectProtocol: (protocol: Protocol) => void;
}

export function HomePage({ onSelectProtocol }: HomePageProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocols();
  }, []);

  async function loadProtocols() {
    setLoading(true);
    const { data, error } = await supabase
      .from("protocols")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProtocols(data);
    setLoading(false);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    createProtocol();
  }

  async function createProtocol() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("protocols")
      .insert({ name: trimmed })
      .select()
      .maybeSingle();
    if (!error && data) {
      setNewName("");
      onSelectProtocol(data as Protocol);
    }
    setCreating(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") createProtocol();
  }

  return (
    <Wrapper>
      <Header>
        <Title>GenderWatch</Title>
        <Subtitle>Protokoll-Ersteller</Subtitle>
      </Header>

      <NewProtocolCard as="form" onSubmit={handleFormSubmit}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <InputText
            id="protocol-name"
            label="Neues Protokoll"
            name="protocol-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <Button
          variant="primary"
          type="submit"
          disabled={creating || !newName.trim()}
          css={{ backgroundColor: "$red100", "&:hover": { backgroundColor: "$red80" }, borderColor: "transparent" }}
        >
          {creating ? "Erstelle..." : "Protokoll starten"}
        </Button>
      </NewProtocolCard>

      <SectionTitle>Gespeicherte Protokolle</SectionTitle>
      <ProtocolList>
        {loading && <EmptyState>Lade Protokolle...</EmptyState>}
        {!loading && protocols.length === 0 && (
          <EmptyState>Noch keine Protokolle. Erstelle dein erstes Protokoll.</EmptyState>
        )}
        {protocols.map((p) => (
          <ProtocolRow key={p.id} onClick={() => onSelectProtocol(p)}>
            <ProtocolName>{p.name}</ProtocolName>
            <ProtocolDate>
              {new Date(p.created_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ProtocolDate>
          </ProtocolRow>
        ))}
      </ProtocolList>
    </Wrapper>
  );
}
