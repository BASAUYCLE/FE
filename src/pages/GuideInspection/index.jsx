import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";
import InspectorLayout from "../../components/layout/InspectorLayout";
import { useAuthOptional } from "../../contexts/AuthContext";
import "../inspector/common/shared.css";
import {
  GUIDE_INSPECTION_HERO,
  GUIDE_INSPECTION_MEMBER,
  GUIDE_INSPECTION_FORMULA,
  GUIDE_INSPECTION_PASS_FAIL,
  GUIDE_INSPECTION_INSPECTOR,
  GUIDE_INSPECTION_BANDS,
  GUIDE_INSPECTION_API_NOTES,
  INSPECTION_CRITERIA_ROWS,
  INSPECTION_SCORE_OPTIONS,
} from "../../constants/guideInspectionContent";
import { INSPECTION_CRITICAL_CRITERIA_KEYS } from "../../constants/inspectionRubric";

function Section({ title, children }) {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Typography
        component="h2"
        sx={{ fontSize: { xs: 18, md: 20 }, fontWeight: 700, mb: 2 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Subheading({ title }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: 15, mt: 2.5, mb: 1.5 }}>
      {title}
    </Typography>
  );
}

function BulletList({ items }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, color: "#374151", fontSize: 14 }}>
      {items.map((t, i) => (
        <li key={i} style={{ marginBottom: 8 }}>
          {t}
        </li>
      ))}
    </Box>
  );
}

function GuideInspectionMain() {
  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 26, md: 32 },
            fontWeight: 800,
            textAlign: "center",
            mb: 2,
          }}
        >
          {GUIDE_INSPECTION_HERO.title}
        </Typography>
        <Typography
          sx={{
            color: "#374151",
            fontSize: 15,
            mb: 5,
            lineHeight: 1.65,
            textAlign: "center",
            maxWidth: 720,
            mx: "auto",
          }}
        >
          {GUIDE_INSPECTION_HERO.lead}
        </Typography>

        <Box
          sx={{
            mb: 5,
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: "#f0fdfa",
            border: "1px solid #99f6e4",
          }}
        >
          <Section title={GUIDE_INSPECTION_MEMBER.title}>
            <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
              {GUIDE_INSPECTION_MEMBER.intro}
            </Typography>

            <Subheading title={GUIDE_INSPECTION_MEMBER.sellerFlow.title} />
            <BulletList items={GUIDE_INSPECTION_MEMBER.sellerFlow.bullets} />

            <Subheading title={GUIDE_INSPECTION_MEMBER.whereToSee.title} />
            <BulletList items={GUIDE_INSPECTION_MEMBER.whereToSee.bullets} />

            <Subheading title={GUIDE_INSPECTION_MEMBER.buyerNotes.title} />
            <BulletList items={GUIDE_INSPECTION_MEMBER.buyerNotes.bullets} />
          </Section>
        </Box>

        <Section title={GUIDE_INSPECTION_FORMULA.title}>
          <BulletList items={GUIDE_INSPECTION_FORMULA.bullets} />
          <Typography sx={{ mt: 2, fontSize: 14, color: "#111827" }}>
            {GUIDE_INSPECTION_FORMULA.formulaLine}
          </Typography>
        </Section>

        <Section title={GUIDE_INSPECTION_PASS_FAIL.title}>
          <BulletList items={GUIDE_INSPECTION_PASS_FAIL.bullets} />
        </Section>

        <Section title="The four allowed scores">
          <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
            Pick exactly one level per criterion; labels match the inspector
            form.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              p: 2,
              bgcolor: "#fff",
              borderRadius: 2,
              border: "1px solid #e5e7eb",
            }}
          >
            {INSPECTION_SCORE_OPTIONS.map((opt) => (
              <Box
                key={opt.value}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "baseline",
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, minWidth: 28 }}
                >
                  {opt.emoji} {opt.value}
                </Typography>
                <Typography component="span" sx={{ fontSize: 14 }}>
                  {opt.labelEn}
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontSize: 13, color: "#6b7280", width: "100%" }}
                >
                  {opt.hintEn}
                </Typography>
              </Box>
            ))}
          </Box>
        </Section>

        <Section title="Six criteria & weights">
          <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
            Weights (%) feed into conditionPercent; total = 100%.
          </Typography>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              bgcolor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box component="thead" sx={{ bgcolor: "#f3f4f6" }}>
              <Box component="tr">
                <Box
                  component="th"
                  sx={{ textAlign: "left", p: 1.5, fontWeight: 700 }}
                >
                  Criterion
                </Box>
                <Box
                  component="th"
                  sx={{ textAlign: "right", p: 1.5, fontWeight: 700 }}
                >
                  %
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {INSPECTION_CRITERIA_ROWS.map((row) => (
                <Box
                  component="tr"
                  key={row.key}
                  sx={{ borderTop: "1px solid #e5e7eb" }}
                >
                  <Box component="td" sx={{ p: 1.5, verticalAlign: "top" }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {row.labelEn}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}
                    >
                      {row.hintEn}
                    </Typography>
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      p: 1.5,
                      textAlign: "right",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.weightPercent}%
                    {INSPECTION_CRITICAL_CRITERIA_KEYS.has(row.key) ? (
                      <Typography
                        component="span"
                        sx={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#b45309",
                          mt: 0.5,
                        }}
                      >
                        0 → FAIL
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Section>

        <Box
          sx={{
            mb: 5,
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: "#f5f3ff",
            border: "1px solid #ddd6fe",
          }}
        >
          <Section title={GUIDE_INSPECTION_INSPECTOR.title}>
            <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
              {GUIDE_INSPECTION_INSPECTOR.intro}
            </Typography>

            <Subheading title={GUIDE_INSPECTION_INSPECTOR.navigation.title} />
            <BulletList items={GUIDE_INSPECTION_INSPECTOR.navigation.bullets} />

            <Subheading
              title={GUIDE_INSPECTION_INSPECTOR.formAndSubmit.title}
            />
            <BulletList
              items={GUIDE_INSPECTION_INSPECTOR.formAndSubmit.bullets}
            />

            <Subheading title={GUIDE_INSPECTION_INSPECTOR.errors.title} />
            <BulletList items={GUIDE_INSPECTION_INSPECTOR.errors.bullets} />
          </Section>
        </Box>

        <Section title={GUIDE_INSPECTION_BANDS.title}>
          <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
            {GUIDE_INSPECTION_BANDS.intro}
          </Typography>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              bgcolor: "#fff",
              border: "1px solid #e5e7eb",
            }}
          >
            <Box component="thead" sx={{ bgcolor: "#f3f4f6" }}>
              <Box component="tr">
                <Box component="th" sx={{ textAlign: "left", p: 1.5 }}>
                  Min. %
                </Box>
                <Box component="th" sx={{ textAlign: "left", p: 1.5 }}>
                  Band
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {GUIDE_INSPECTION_BANDS.rows.map((r) => (
                <Box
                  component="tr"
                  key={r.minPct}
                  sx={{ borderTop: "1px solid #e5e7eb" }}
                >
                  <Box component="td" sx={{ p: 1.5 }}>
                    ≥ {r.minPct}%
                  </Box>
                  <Box component="td" sx={{ p: 1.5 }}>
                    {r.label}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Section>

        <Section title={GUIDE_INSPECTION_API_NOTES.title}>
          <BulletList items={GUIDE_INSPECTION_API_NOTES.bullets} />
        </Section>
      </Container>
    </Box>
  );
}

/**
 * Inspection scoring guide. Inspectors: InspectorLayout; others: Header + Footer.
 */
export default function GuideInspection() {
  const auth = useAuthOptional();
  const role = String(
    auth?.user?.role ?? auth?.user?.userRole ?? auth?.user?.user_role ?? "",
  ).toUpperCase();
  const asInspector = role === "INSPECTOR";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  if (asInspector) {
    return (
      <InspectorLayout>
        <div className="inspector-page">
          <div className="inspector-dashboard">
            <div className="inspector-content">
              <GuideInspectionMain />
            </div>
          </div>
        </div>
      </InspectorLayout>
    );
  }

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />
      <GuideInspectionMain />
      <Footer showSubscribe={false} />
    </Box>
  );
}
