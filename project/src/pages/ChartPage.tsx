import { useState, useEffect } from "react";
import { styled, Button } from "@washingtonpost/wpds-ui-kit";
import { supabase, Protocol, SpeakingEvent, GenderType } from "../lib/supabase";

// ── Styles ───────────────────────────────────────────────────────────

const Page = styled("div", {
  minHeight: "100vh",
  backgroundColor: "$background",
  display: "flex",
  flexDirection: "column",
});

const TopBar = styled("div", {
  backgroundColor: "$surface",
  borderBottom: "1px solid $outline",
  padding: "$100 $150",
  display: "flex",
  alignItems: "center",
  gap: "$100",
  position: "sticky",
  top: 0,
  zIndex: "$shell",
});

const BackBtn = styled("button", {
  fontFamily: "$meta",
  fontSize: "$087",
  fontWeight: "$bold",
  color: "$primary",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "$025 $050",
  borderRadius: "$025",
  "@hover": { "&:hover": { backgroundColor: "$secondary" } },
});

const ProtocolTitle = styled("span", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$150",
  color: "$primary",
  flex: 1,
});

const Body = styled("div", {
  flex: 1,
  padding: "$200 $150",
  maxWidth: "800px",
  margin: "0 auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "$200",
  "@sm": { padding: "$100 $075" },
});

const ChartCard = styled("div", {
  backgroundColor: "$surface",
  borderRadius: "$050",
  boxShadow: "$300",
  padding: "$150 $200",
  "@sm": { padding: "$100 $100" },
});

const ChartTitle = styled("h2", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$125",
  color: "$primary",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "$150",
});

const BarGroup = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$100",
  marginBottom: "$150",
});

const BarRow = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "$100",
});

const BarLabel = styled("span", {
  fontFamily: "$meta",
  fontSize: "$087",
  fontWeight: "$bold",
  width: "90px",
  minWidth: "90px",
  color: "$primary",
  textAlign: "right",
});

const BarTrack = styled("div", {
  flex: 1,
  height: "36px",
  backgroundColor: "$secondary",
  borderRadius: "$025",
  overflow: "hidden",
  position: "relative",
});

const BarFill = styled("div", {
  height: "100%",
  borderRadius: "$025",
  display: "flex",
  alignItems: "center",
  paddingLeft: "$075",
  transition: "width 600ms cubic-bezier(0.34,1.56,0.64,1)",
  minWidth: 2,
  variants: {
    color: {
      red: { backgroundColor: "$red100" },
      grey: { backgroundColor: "$gray200" },
      darkgrey: { backgroundColor: "$gray100" },
    },
  },
});

const BarValue = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  fontWeight: "$bold",
  color: "white",
  whiteSpace: "nowrap",
});

const BarValueRight = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  marginLeft: "$075",
  whiteSpace: "nowrap",
});

const Divider = styled("div", {
  height: 1,
  backgroundColor: "$outline",
  margin: "$100 0",
});

const StatsGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "$100",
  "@sm": { gridTemplateColumns: "1fr 1fr" },
});

const StatBox = styled("div", {
  backgroundColor: "$background-forSurfaces",
  borderRadius: "$025",
  padding: "$075 $100",
  display: "flex",
  flexDirection: "column",
  gap: "$025",
});

const StatLabel = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

const StatValue = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$125",
  color: "$primary",
});

const StatPct = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
});

const ExportBtn = styled("button", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  backgroundColor: "$gray20",
  color: "white",
  border: "none",
  borderRadius: "$025",
  padding: "$075 $125",
  cursor: "pointer",
  "@hover": { "&:hover": { backgroundColor: "$gray40" } },
});

// ── Helpers ──────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function pct(val: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((val / total) * 100)}%`;
}

// ── Component ─────────────────────────────────────────────────────────

interface ChartPageProps {
  protocol: Protocol;
  onBack: () => void;
}

export function ChartPage({ protocol, onBack }: ChartPageProps) {
  const [events, setEvents] = useState<SpeakingEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [protocol.id]);

  async function loadEvents() {
    const { data } = await supabase
      .from("speaking_events")
      .select("*")
      .eq("protocol_id", protocol.id)
      .not("duration_ms", "is", null);
    if (data) setEvents(data as SpeakingEvent[]);
    setLoaded(true);
  }

  // Totals per raw gender
  const rawTotals: Record<GenderType, number> = {
    female: 0, male: 0, tina_female: 0, tina_male: 0, tina_other: 0,
  };
  for (const ev of events) {
    if (ev.duration_ms) rawTotals[ev.gender] += ev.duration_ms;
  }

  // Chart categories
  // Female bar = female + tina_female
  // Male bar   = male + tina_male
  // Tina* bar  = tina_female + tina_male + tina_other
  const femaleMs = rawTotals.female + rawTotals.tina_female;
  const maleMs = rawTotals.male + rawTotals.tina_male;
  const tinaMs = rawTotals.tina_female + rawTotals.tina_male + rawTotals.tina_other;

  const grandTotal = femaleMs + maleMs + tinaMs;
  // Note: grandTotal may count tina_female + tina_male twice intentionally (they appear in both female/male AND tina bars)
  // For percentage we compute against the "unique speaking time" = sum of all raw categories
  const uniqueTotal = rawTotals.female + rawTotals.male + rawTotals.tina_female + rawTotals.tina_male + rawTotals.tina_other;
  const maxBar = Math.max(femaleMs, maleMs, tinaMs, 1);

  function barWidth(ms: number) {
    return `${Math.round((ms / maxBar) * 100)}%`;
  }

  function exportCSV() {
    const header = "Kategorie,Millisekunden,Sekunden,Minuten,Anteil\n";
    const rows = [
      `Weiblich,${femaleMs},${(femaleMs / 1000).toFixed(1)},${(femaleMs / 60000).toFixed(2)},${pct(femaleMs, uniqueTotal)}`,
      `Männlich,${maleMs},${(maleMs / 1000).toFixed(1)},${(maleMs / 60000).toFixed(2)},${pct(maleMs, uniqueTotal)}`,
      `Tina*,${tinaMs},${(tinaMs / 1000).toFixed(1)},${(tinaMs / 60000).toFixed(2)},${pct(tinaMs, uniqueTotal)}`,
    ].join("\n");
    const detail = "\n\nEinzelkategorien\nKategorie,Millisekunden\n" +
      Object.entries(rawTotals).map(([k, v]) => `${k},${v}`).join("\n");
    const blob = new Blob([header + rows + detail], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genderwatch_${protocol.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={onBack}>← Aufnahme</BackBtn>
        <ProtocolTitle>{protocol.name} — Auswertung</ProtocolTitle>
        <ExportBtn onClick={exportCSV} title="Als CSV speichern">CSV</ExportBtn>
      </TopBar>

      <Body>
        <ChartCard>
          <ChartTitle>Redezeit nach Geschlecht</ChartTitle>

          <BarGroup>
            {/* Female bar */}
            <BarRow>
              <BarLabel>Weiblich</BarLabel>
              <BarTrack>
                <BarFill color="red" css={{ width: loaded ? barWidth(femaleMs) : "0%" }}>
                  {femaleMs > 0 && <BarValue>{formatMs(femaleMs)}</BarValue>}
                </BarFill>
              </BarTrack>
              <BarValueRight>{pct(femaleMs, uniqueTotal)}</BarValueRight>
            </BarRow>

            {/* Male bar */}
            <BarRow>
              <BarLabel>Männlich</BarLabel>
              <BarTrack>
                <BarFill color="grey" css={{ width: loaded ? barWidth(maleMs) : "0%" }}>
                  {maleMs > 0 && <BarValue>{formatMs(maleMs)}</BarValue>}
                </BarFill>
              </BarTrack>
              <BarValueRight>{pct(maleMs, uniqueTotal)}</BarValueRight>
            </BarRow>

            {/* Tina* bar */}
            <BarRow>
              <BarLabel>Tina*</BarLabel>
              <BarTrack>
                <BarFill color="darkgrey" css={{ width: loaded ? barWidth(tinaMs) : "0%" }}>
                  {tinaMs > 0 && <BarValue>{formatMs(tinaMs)}</BarValue>}
                </BarFill>
              </BarTrack>
              <BarValueRight>{pct(tinaMs, uniqueTotal)}</BarValueRight>
            </BarRow>
          </BarGroup>

          <Divider />

          <StatsGrid>
            <StatBox>
              <StatLabel>Weiblich</StatLabel>
              <StatValue css={{ color: "$red100" }}>{formatMs(femaleMs)}</StatValue>
              <StatPct>davon Tina*: {formatMs(rawTotals.tina_female)}</StatPct>
            </StatBox>
            <StatBox>
              <StatLabel>Männlich</StatLabel>
              <StatValue css={{ color: "$gray60" }}>{formatMs(maleMs)}</StatValue>
              <StatPct>davon Tina*: {formatMs(rawTotals.tina_male)}</StatPct>
            </StatBox>
            <StatBox>
              <StatLabel>Tina*</StatLabel>
              <StatValue css={{ color: "$gray100" }}>{formatMs(tinaMs)}</StatValue>
              <StatPct>(*): {formatMs(rawTotals.tina_other)}</StatPct>
            </StatBox>
            <StatBox>
              <StatLabel>Gesamtredezeit</StatLabel>
              <StatValue>{formatMs(uniqueTotal)}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Sprechereignisse</StatLabel>
              <StatValue>{events.length}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Protokoll erstellt</StatLabel>
              <StatValue css={{ fontSize: "$087" }}>
                {new Date(protocol.created_at).toLocaleDateString("de-DE")}
              </StatValue>
            </StatBox>
          </StatsGrid>

          {uniqueTotal === 0 && loaded && (
            <p style={{ fontFamily: "var(--wpds-fonts-meta)", color: "var(--wpds-colors-onBackground-subtle)", textAlign: "center", marginTop: "24px" }}>
              Noch keine Redebeiträge aufgezeichnet. Gehe zur Aufnahme und zeichne auf.
            </p>
          )}
        </ChartCard>

        <p style={{ fontFamily: "var(--wpds-fonts-meta)", fontSize: "0.75rem", color: "var(--wpds-colors-onBackground-subtle)", textAlign: "center" }}>
          Hinweis: Tina*-Redezeiten (w) und (m) werden sowohl in der Tina*-Säule als auch in der jeweiligen Weiblich/Männlich-Säule addiert.
        </p>
      </Body>
    </Page>
  );
}
