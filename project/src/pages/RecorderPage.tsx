import { useState, useEffect, useRef } from "react";
import { styled, Button } from "@washingtonpost/wpds-ui-kit";
import { supabase, Protocol, SpeakingEvent, GenderType } from "../lib/supabase";

// ── Styled primitives ────────────────────────────────────────────────

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
  "@hover": {
    "&:hover": { backgroundColor: "$secondary" },
  },
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
  display: "flex",
  flexDirection: "column",
  gap: "$200",
  maxWidth: "800px",
  margin: "0 auto",
  width: "100%",
  "@sm": { padding: "$100 $075" },
});

const StatusBar = styled("div", {
  backgroundColor: "$surface",
  borderRadius: "$050",
  padding: "$100 $150",
  boxShadow: "$200",
  display: "flex",
  alignItems: "center",
  gap: "$100",
  flexWrap: "wrap",
});

const StatusDot = styled("span", {
  width: 12,
  height: 12,
  borderRadius: "$round",
  display: "inline-block",
  variants: {
    active: {
      true: { backgroundColor: "$red100", boxShadow: "0 0 0 3px $colors$red600" },
      false: { backgroundColor: "$gray200" },
    },
  },
});

const StatusLabel = styled("span", {
  fontFamily: "$meta",
  fontSize: "$087",
  color: "$onBackground-subtle",
  flex: 1,
});

const CurrentTimer = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$125",
  color: "$primary",
  letterSpacing: "0.04em",
});

const SectionTitle = styled("h2", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$100",
  color: "$primary",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "$075",
});

const ButtonGrid = styled("div", {
  display: "grid",
  gap: "$100",
  gridTemplateColumns: "1fr 1fr",
  "@sm": { gridTemplateColumns: "1fr" },
});

const BigButton = styled("button", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$112",
  borderRadius: "$050",
  padding: "$100 $150",
  cursor: "pointer",
  border: "2px solid transparent",
  transition: "all 120ms ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "$025",

  variants: {
    active: {
      true: {},
      false: {},
    },
    colorScheme: {
      red: {
        backgroundColor: "$red100",
        color: "white",
        "@hover": {
          "&:hover": { backgroundColor: "$red80" },
        },
      },
      grey: {
        backgroundColor: "$gray200",
        color: "$gray0",
        "@hover": {
          "&:hover": { backgroundColor: "$gray100" },
        },
      },
      stop: {
        backgroundColor: "$surface",
        color: "$primary",
        border: "2px solid $outline",
        "@hover": {
          "&:hover": { backgroundColor: "$secondary" },
        },
      },
    },
  },

  compoundVariants: [
    {
      active: true,
      colorScheme: "red",
      css: { boxShadow: "0 0 0 4px $colors$red600", transform: "scale(0.98)" },
    },
    {
      active: true,
      colorScheme: "grey",
      css: { boxShadow: "0 0 0 4px $colors$gray400", transform: "scale(0.98)" },
    },
  ],
});

const BtnLabel = styled("span", {
  fontSize: "$150",
});

const BtnSub = styled("span", {
  fontSize: "$075",
  opacity: 0.85,
  fontWeight: "$regular",
});

const TinaCard = styled("div", {
  backgroundColor: "$surface",
  borderRadius: "$050",
  boxShadow: "$200",
  padding: "$100 $150",
  border: "1px solid $outline",
});

const TinaHeader = styled("div", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$087",
  color: "$onBackground-subtle",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "$075",
});

const TinaRow = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "$075",
  "@sm": { gridTemplateColumns: "1fr" },
});

const StopRow = styled("div", {
  display: "flex",
  gap: "$100",
});

const SummaryCard = styled("div", {
  backgroundColor: "$surface",
  borderRadius: "$050",
  boxShadow: "$200",
  padding: "$100 $150",
  display: "flex",
  gap: "$100",
  flexWrap: "wrap",
});

const SummaryItem = styled("div", {
  flex: 1,
  minWidth: "100px",
  display: "flex",
  flexDirection: "column",
  gap: "$025",
});

const SummaryLabel = styled("span", {
  fontFamily: "$meta",
  fontSize: "$075",
  color: "$onBackground-subtle",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const SummaryValue = styled("span", {
  fontFamily: "$meta",
  fontWeight: "$bold",
  fontSize: "$125",
  color: "$primary",
});

// ── Helpers ─────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function genderLabel(g: GenderType): string {
  switch (g) {
    case "female": return "Weiblich";
    case "male": return "Männlich";
    case "tina_female": return "Tina* (w)";
    case "tina_male": return "Tina* (m)";
    case "tina_other": return "Tina* (*)";
  }
}

// ── Component ────────────────────────────────────────────────────────

interface RecorderPageProps {
  protocol: Protocol;
  onBack: () => void;
  onShowChart: () => void;
}

export function RecorderPage({ protocol, onBack, onShowChart }: RecorderPageProps) {
  const [events, setEvents] = useState<SpeakingEvent[]>([]);
  const [activeGender, setActiveGender] = useState<GenderType | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeStart, setActiveStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadEvents();
  }, [protocol.id]);

  useEffect(() => {
    if (activeStart) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - activeStart.getTime());
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeStart]);

  async function loadEvents() {
    const { data } = await supabase
      .from("speaking_events")
      .select("*")
      .eq("protocol_id", protocol.id)
      .order("started_at", { ascending: true });
    if (data) setEvents(data as SpeakingEvent[]);
  }

  async function endCurrentEvent(endTime: Date) {
    if (!activeEventId || !activeStart) return;
    const duration = endTime.getTime() - activeStart.getTime();
    await supabase
      .from("speaking_events")
      .update({
        ended_at: endTime.toISOString(),
        duration_ms: duration,
      })
      .eq("id", activeEventId);
  }

  async function pressGender(gender: GenderType) {
    const now = new Date();

    if (activeGender === gender && activeEventId) {
      // Same button pressed again — stop it
      await endCurrentEvent(now);
      setActiveGender(null);
      setActiveEventId(null);
      setActiveStart(null);
      await loadEvents();
      return;
    }

    // End previous event if any
    await endCurrentEvent(now);

    // Start new event
    const { data, error } = await supabase
      .from("speaking_events")
      .insert({ protocol_id: protocol.id, gender, started_at: now.toISOString() })
      .select()
      .maybeSingle();

    if (!error && data) {
      setActiveGender(gender);
      setActiveEventId(data.id);
      setActiveStart(now);
      setElapsed(0);
      await loadEvents();
    }
  }

  async function pressStop() {
    if (!activeEventId) return;
    const now = new Date();
    await endCurrentEvent(now);
    setActiveGender(null);
    setActiveEventId(null);
    setActiveStart(null);
    await loadEvents();
  }

  // ── Compute totals ───────────────────────────────────────────────

  function getTotals() {
    const totals: Record<GenderType, number> = {
      female: 0, male: 0, tina_female: 0, tina_male: 0, tina_other: 0,
    };
    for (const ev of events) {
      if (ev.duration_ms) totals[ev.gender] += ev.duration_ms;
    }
    // Add currently running segment
    if (activeGender && activeStart) {
      totals[activeGender] += elapsed;
    }
    return totals;
  }

  const totals = getTotals();
  const femaleTotal = totals.female + totals.tina_female;
  const maleTotal = totals.male + totals.tina_male;
  const tinaTotal = totals.tina_female + totals.tina_male + totals.tina_other;

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={onBack}>← Zurück</BackBtn>
        <ProtocolTitle>{protocol.name}</ProtocolTitle>
        <Button
          variant="primary"
          density="compact"
          onClick={onShowChart}
          css={{ backgroundColor: "$gray20", "@hover": { "&:hover": { backgroundColor: "$gray40" } } }}
        >
          Auswertung
        </Button>
      </TopBar>

      <Body>
        {/* Status bar */}
        <StatusBar>
          <StatusDot active={activeGender !== null} />
          <StatusLabel>
            {activeGender
              ? `Aktiv: ${genderLabel(activeGender)}`
              : "Gestoppt — Drücke eine Sprecher*in-Taste"}
          </StatusLabel>
          {activeGender && (
            <CurrentTimer>{formatMs(elapsed)}</CurrentTimer>
          )}
        </StatusBar>

        {/* Main gender buttons */}
        <div>
          <SectionTitle>Sprecher*in</SectionTitle>
          <ButtonGrid>
            <BigButton
              colorScheme="red"
              active={activeGender === "female"}
              onClick={() => pressGender("female")}
              aria-label="Weiblich"
            >
              <BtnLabel>W</BtnLabel>
              <BtnSub>Weiblich</BtnSub>
            </BigButton>
            <BigButton
              colorScheme="grey"
              active={activeGender === "male"}
              onClick={() => pressGender("male")}
              aria-label="Männlich"
            >
              <BtnLabel>M</BtnLabel>
              <BtnSub>Männlich</BtnSub>
            </BigButton>
          </ButtonGrid>
        </div>

        {/* Tina* section */}
        <TinaCard>
          <TinaHeader>Tina* — Trans / Inter / Nicht-binär / Agender</TinaHeader>
          <TinaRow>
            <BigButton
              colorScheme="red"
              active={activeGender === "tina_female"}
              onClick={() => pressGender("tina_female")}
              aria-label="Tina weiblich"
              css={{ fontSize: "$087" }}
            >
              <BtnLabel>T*W</BtnLabel>
              <BtnSub>Tina (w)</BtnSub>
            </BigButton>
            <BigButton
              colorScheme="grey"
              active={activeGender === "tina_male"}
              onClick={() => pressGender("tina_male")}
              aria-label="Tina männlich"
              css={{ fontSize: "$087" }}
            >
              <BtnLabel>T*M</BtnLabel>
              <BtnSub>Tina (m)</BtnSub>
            </BigButton>
            <BigButton
              colorScheme="grey"
              active={activeGender === "tina_other"}
              onClick={() => pressGender("tina_other")}
              aria-label="Tina andere"
              css={{ fontSize: "$087", backgroundColor: "$gray300" }}
            >
              <BtnLabel>T*</BtnLabel>
              <BtnSub>Tina (*)</BtnSub>
            </BigButton>
          </TinaRow>
        </TinaCard>

        {/* Stop */}
        <StopRow>
          <BigButton
            colorScheme="stop"
            active={false}
            onClick={pressStop}
            disabled={!activeGender}
            css={{
              flex: 1,
              opacity: activeGender ? 1 : 0.4,
              cursor: activeGender ? "pointer" : "not-allowed",
            }}
            aria-label="Pause - niemand spricht"
          >
            <BtnLabel>⏸</BtnLabel>
            <BtnSub>Niemand spricht</BtnSub>
          </BigButton>
        </StopRow>

        {/* Running totals */}
        <div>
          <SectionTitle>Laufende Übersicht</SectionTitle>
          <SummaryCard>
            <SummaryItem>
              <SummaryLabel>Weiblich</SummaryLabel>
              <SummaryValue css={{ color: "$red100" }}>{formatMs(femaleTotal)}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Männlich</SummaryLabel>
              <SummaryValue css={{ color: "$gray60" }}>{formatMs(maleTotal)}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Tina*</SummaryLabel>
              <SummaryValue css={{ color: "$gray100" }}>{formatMs(tinaTotal)}</SummaryValue>
            </SummaryItem>
          </SummaryCard>
        </div>
      </Body>
    </Page>
  );
}
