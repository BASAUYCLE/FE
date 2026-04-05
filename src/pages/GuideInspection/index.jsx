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

function Section({ titleVi, titleEn, children }) {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Typography
        component="h2"
        sx={{ fontSize: { xs: 18, md: 20 }, fontWeight: 700, mb: 0.5 }}
      >
        {titleVi}
      </Typography>
      <Typography
        sx={{ fontSize: 14, color: "#6b7280", fontWeight: 600, mb: 2 }}
      >
        {titleEn}
      </Typography>
      {children}
    </Box>
  );
}

function Subheading({ titleVi, titleEn }) {
  return (
    <Box sx={{ mt: 2.5, mb: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.25 }}>
        {titleVi}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 1.5 }}>
        {titleEn}
      </Typography>
    </Box>
  );
}

function BulletList({ itemsVi, itemsEn }) {
  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box
        component="ul"
        sx={{ m: 0, pl: 2.5, color: "#374151", fontSize: 14 }}
      >
        {itemsVi.map((t, i) => (
          <li key={`vi-${i}`} style={{ marginBottom: 8 }}>
            {t}
          </li>
        ))}
      </Box>
      <Box
        component="ul"
        sx={{
          m: 0,
          pl: 2,
          ml: 0.5,
          color: "#6b7280",
          fontSize: 13,
          borderLeft: "3px solid #e5e7eb",
        }}
      >
        {itemsEn.map((t, i) => (
          <li key={`en-${i}`} style={{ marginBottom: 8 }}>
            {t}
          </li>
        ))}
      </Box>
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
            mb: 1,
          }}
        >
          {GUIDE_INSPECTION_HERO.titleEn}
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
            color: "#374151",
            mb: 3,
          }}
        >
          {GUIDE_INSPECTION_HERO.titleVi}
        </Typography>
        <Typography
          sx={{
            color: "#374151",
            fontSize: 15,
            mb: 2,
            lineHeight: 1.65,
          }}
        >
          {GUIDE_INSPECTION_HERO.leadVi}
        </Typography>
        <Typography
          sx={{
            color: "#6b7280",
            fontSize: 14,
            mb: 5,
            lineHeight: 1.65,
          }}
        >
          {GUIDE_INSPECTION_HERO.leadEn}
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
          <Section
            titleVi={GUIDE_INSPECTION_MEMBER.titleVi}
            titleEn={GUIDE_INSPECTION_MEMBER.titleEn}
          >
            <Typography sx={{ color: "#374151", fontSize: 14, mb: 1.5 }}>
              {GUIDE_INSPECTION_MEMBER.introVi}
            </Typography>
            <Typography sx={{ color: "#6b7280", fontSize: 13, mb: 1 }}>
              {GUIDE_INSPECTION_MEMBER.introEn}
            </Typography>

            <Subheading
              titleVi={GUIDE_INSPECTION_MEMBER.sellerFlow.titleVi}
              titleEn={GUIDE_INSPECTION_MEMBER.sellerFlow.titleEn}
            />
            <BulletList
              itemsVi={GUIDE_INSPECTION_MEMBER.sellerFlow.bulletsVi}
              itemsEn={GUIDE_INSPECTION_MEMBER.sellerFlow.bulletsEn}
            />

            <Subheading
              titleVi={GUIDE_INSPECTION_MEMBER.whereToSee.titleVi}
              titleEn={GUIDE_INSPECTION_MEMBER.whereToSee.titleEn}
            />
            <BulletList
              itemsVi={GUIDE_INSPECTION_MEMBER.whereToSee.bulletsVi}
              itemsEn={GUIDE_INSPECTION_MEMBER.whereToSee.bulletsEn}
            />

            <Subheading
              titleVi={GUIDE_INSPECTION_MEMBER.buyerNotes.titleVi}
              titleEn={GUIDE_INSPECTION_MEMBER.buyerNotes.titleEn}
            />
            <BulletList
              itemsVi={GUIDE_INSPECTION_MEMBER.buyerNotes.bulletsVi}
              itemsEn={GUIDE_INSPECTION_MEMBER.buyerNotes.bulletsEn}
            />
          </Section>
        </Box>

        <Section
          titleVi={GUIDE_INSPECTION_FORMULA.titleVi}
          titleEn={GUIDE_INSPECTION_FORMULA.titleEn}
        >
          <BulletList
            itemsVi={GUIDE_INSPECTION_FORMULA.bulletsVi}
            itemsEn={GUIDE_INSPECTION_FORMULA.bulletsEn}
          />
          <Typography sx={{ mt: 2, fontSize: 14, color: "#111827" }}>
            {GUIDE_INSPECTION_FORMULA.formulaLineVi}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "#6b7280" }}>
            {GUIDE_INSPECTION_FORMULA.formulaLineEn}
          </Typography>
        </Section>

        <Section
          titleVi={GUIDE_INSPECTION_PASS_FAIL.titleVi}
          titleEn={GUIDE_INSPECTION_PASS_FAIL.titleEn}
        >
          <BulletList
            itemsVi={GUIDE_INSPECTION_PASS_FAIL.bulletsVi}
            itemsEn={GUIDE_INSPECTION_PASS_FAIL.bulletsEn}
          />
        </Section>

        <Section titleVi="Bốn mức điểm" titleEn="The four allowed scores">
          <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
            Mỗi tiêu chí chọn đúng một mức; nhãn gợi ý bên dưới khớp form
            inspector.
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
                  {opt.labelVi} — {opt.labelEn}
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontSize: 13, color: "#6b7280", width: "100%" }}
                >
                  {opt.hintVi}
                </Typography>
              </Box>
            ))}
          </Box>
        </Section>

        <Section
          titleVi="Sáu tiêu chí & trọng số"
          titleEn="Six criteria & weights"
        >
          <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
            Trọng số (%) dùng trong công thức conditionPercent; tổng = 100%.
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
                  Tiêu chí
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
                      {row.labelVi}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                      {row.labelEn}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "#9ca3af", mt: 0.5 }}
                    >
                      {row.hintVi}
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
                        0 điểm → FAIL
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
          <Section
            titleVi={GUIDE_INSPECTION_INSPECTOR.titleVi}
            titleEn={GUIDE_INSPECTION_INSPECTOR.titleEn}
          >
            <Typography sx={{ color: "#374151", fontSize: 14, mb: 1.5 }}>
              {GUIDE_INSPECTION_INSPECTOR.introVi}
            </Typography>
            <Typography sx={{ color: "#6b7280", fontSize: 13, mb: 1 }}>
              {GUIDE_INSPECTION_INSPECTOR.introEn}
            </Typography>

            <Subheading
              titleVi={GUIDE_INSPECTION_INSPECTOR.navigation.titleVi}
              titleEn={GUIDE_INSPECTION_INSPECTOR.navigation.titleEn}
            />
            <BulletList
              itemsVi={GUIDE_INSPECTION_INSPECTOR.navigation.bulletsVi}
              itemsEn={GUIDE_INSPECTION_INSPECTOR.navigation.bulletsEn}
            />

            <Subheading
              titleVi={GUIDE_INSPECTION_INSPECTOR.formAndSubmit.titleVi}
              titleEn={GUIDE_INSPECTION_INSPECTOR.formAndSubmit.titleEn}
            />
            <BulletList
              itemsVi={GUIDE_INSPECTION_INSPECTOR.formAndSubmit.bulletsVi}
              itemsEn={GUIDE_INSPECTION_INSPECTOR.formAndSubmit.bulletsEn}
            />

            <Subheading
              titleVi={GUIDE_INSPECTION_INSPECTOR.errors.titleVi}
              titleEn={GUIDE_INSPECTION_INSPECTOR.errors.titleEn}
            />
            <BulletList
              itemsVi={GUIDE_INSPECTION_INSPECTOR.errors.bulletsVi}
              itemsEn={GUIDE_INSPECTION_INSPECTOR.errors.bulletsEn}
            />
          </Section>
        </Box>

        <Section
          titleVi={GUIDE_INSPECTION_BANDS.titleVi}
          titleEn={GUIDE_INSPECTION_BANDS.titleEn}
        >
          <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
            {GUIDE_INSPECTION_BANDS.introVi}
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 13, mb: 2 }}>
            {GUIDE_INSPECTION_BANDS.introEn}
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
                  Ngưỡng % (từ)
                </Box>
                <Box component="th" sx={{ textAlign: "left", p: 1.5 }}>
                  Nhãn
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
                    {r.labelVi}
                    <Typography
                      component="div"
                      sx={{ fontSize: 12, color: "#6b7280" }}
                    >
                      {r.labelEn}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Section>

        <Section
          titleVi={GUIDE_INSPECTION_API_NOTES.titleVi}
          titleEn={GUIDE_INSPECTION_API_NOTES.titleEn}
        >
          <BulletList
            itemsVi={GUIDE_INSPECTION_API_NOTES.bulletsVi}
            itemsEn={GUIDE_INSPECTION_API_NOTES.bulletsEn}
          />
        </Section>
      </Container>
    </Box>
  );
}

/**
 * Hướng dẫn chấm điểm / kiểm định / %.
 * Inspector: giữ sidebar Inspector (tránh lẫn navbar member). Member/khách: Header + Footer.
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
