import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  IconButton,
  Fade,
  Zoom,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ZoomIn } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { BICYCLE_PHOTO_CRITERIA } from "../../constants/bicyclePhotoCriteria";
import drivesideExample from "../../assets/driveside.jpg";
import nonDrivesideExample from "../../assets/non-driveside.jpg";
import cockpitExample from "../../assets/cockpit.jpg";
import drivetrainExample from "../../assets/drivetrain.jpg";
import frontBrakeExample from "../../assets/frontbrake.jpg";
import rearBrakeExample from "../../assets/rearbrake.jpg";
import defectsExample from "../../assets/defects.jpg";

const GUIDE_EXAMPLE_PHOTOS = {
  OVERALL_DRIVE_SIDE: {
    src: drivesideExample,
    altThumb: "Example photo: full bike, drive side",
    altLarge: "Example photo: full bike, drive side (zoomed)",
  },
  OVERALL_NON_DRIVE_SIDE: {
    src: nonDrivesideExample,
    altThumb: "Example photo: full bike, non-drive side",
    altLarge: "Example photo: full bike, non-drive side (zoomed)",
  },
  COCKPIT_AREA: {
    src: cockpitExample,
    altThumb: "Example photo: cockpit area",
    altLarge: "Example photo: cockpit area (zoomed)",
  },
  DRIVETRAIN_CLOSEUP: {
    src: drivetrainExample,
    altThumb: "Example photo: drivetrain close-up",
    altLarge: "Example photo: drivetrain close-up (zoomed)",
  },
  FRONT_BRAKE: {
    src: frontBrakeExample,
    altThumb: "Example photo: front brake",
    altLarge: "Example photo: front brake (zoomed)",
  },
  REAR_BRAKE: {
    src: rearBrakeExample,
    altThumb: "Example photo: rear brake",
    altLarge: "Example photo: rear brake (zoomed)",
  },
  DEFECT_POINT: {
    src: defectsExample,
    altThumb: "Example photo: defect / scratch point",
    altLarge: "Example photo: defect / scratch point (zoomed)",
  },
};

const GUIDE_HINTS_EN = {
  OVERALL_DRIVE_SIDE:
    "Take a side or slight diagonal shot showing frame, wheels, and drivetrain on the drive side. This is usually the best cover thumbnail.",
  OVERALL_NON_DRIVE_SIDE:
    "Use a similar angle from the opposite side to help buyers and inspectors compare the bike overall.",
  COCKPIT_AREA:
    "Capture handlebar, stem, controls, and display (if any) clearly so steering/control condition is visible.",
  DRIVETRAIN_CLOSEUP:
    "Close-up chainring, cassette, derailleur, and chain. Use good lighting so wear and grease condition can be seen.",
  FRONT_BRAKE:
    "Show front brake caliper/disc (or pads for rim brakes), model details, and visible wear condition.",
  REAR_BRAKE:
    "Same as front brake: keep exposure balanced and ensure brake and tire wear condition are clearly visible.",
  DEFECT_POINT:
    "One photo per defect area (paint scratch, dent, carbon crack, etc.). Upload multiple photos for multiple defects.",
};

export default function GuidePhotoUpload() {
  const [exampleLightboxCode, setExampleLightboxCode] = useState(null);
  const lightboxExampleRef = useRef(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "Bike Photo Guide | BASAUYCLE";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
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
            BASAUYCLE Bike Photo Guide
          </Typography>
          <Typography
            sx={{ textAlign: "center", color: "#64748b", fontSize: 15, mb: 4 }}
          >
            Help buyers and moderators review bike condition clearly. Please
            prepare all required photo angles in the table below before posting.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Why are full photo angles required?
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            BASAUYCLE uses moderation and, when needed, inspection workflows.
            Standardized photos improve <strong>condition transparency</strong>,
            reduce dispute risk, and help your listing get processed faster.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Uploaded files should be clear <strong>image files</strong> (such as
            JPG/PNG). Each required slot on the posting form should include at
            least one image. A full drive-side shot is typically used as the
            marketplace thumbnail.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Required photo angles
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: 13, mb: 1.5 }}>
            The first six angles are required; the defects/scratches section is
            optional but strongly recommended when damage exists.
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ mb: 3, border: "1px solid #e2e8f0" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>
                    Photo angle
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>How to shoot</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {BICYCLE_PHOTO_CRITERIA.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell sx={{ fontSize: 14, verticalAlign: "top" }}>
                      <strong>{row.titleEn}</strong>
                      {GUIDE_EXAMPLE_PHOTOS[row.code] && (
                        <Box
                          sx={{
                            position: "relative",
                            display: "block",
                            width: "100%",
                            maxWidth: 320,
                            mt: 1.5,
                            borderRadius: 4,
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Box
                            component="img"
                            src={GUIDE_EXAMPLE_PHOTOS[row.code].src}
                            alt={GUIDE_EXAMPLE_PHOTOS[row.code].altThumb}
                            sx={{
                              display: "block",
                              width: "100%",
                              height: "auto",
                              verticalAlign: "bottom",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            type="button"
                            size="small"
                            aria-label="Zoom example image"
                            onClick={() => {
                              lightboxExampleRef.current =
                                GUIDE_EXAMPLE_PHOTOS[row.code];
                              setExampleLightboxCode(row.code);
                            }}
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              bgcolor: "rgba(255,255,255,0.94)",
                              color: "#0f766e",
                              boxShadow: "0 1px 4px rgba(15,23,42,0.12)",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,1)",
                              },
                            }}
                          >
                            <ZoomIn size={18} strokeWidth={2} aria-hidden />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#4b5563",
                        fontSize: 14,
                        verticalAlign: "top",
                      }}
                    >
                      {GUIDE_HINTS_EN[row.code] ?? row.hintVi}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={Boolean(exampleLightboxCode)}
            onClose={() => setExampleLightboxCode(null)}
            maxWidth={false}
            TransitionComponent={Fade}
            transitionDuration={{ enter: 320, exit: 220 }}
            slotProps={{
              backdrop: {
                sx: {
                  backgroundColor: "rgba(15, 23, 42, 0.48)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                },
              },
              paper: {
                sx: {
                  bgcolor: "transparent",
                  backgroundImage: "none",
                  boxShadow: "none",
                  overflow: "visible",
                  maxWidth: "min(96vw, 1120px)",
                  width: "100%",
                  m: 2,
                },
              },
            }}
          >
            <IconButton
              type="button"
              aria-label="Close"
              onClick={() => setExampleLightboxCode(null)}
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
                zIndex: 1,
                color: "#f8fafc",
                bgcolor: "rgba(15, 23, 42, 0.45)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                "&:hover": {
                  bgcolor: "rgba(15, 23, 42, 0.62)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent
              sx={{
                p: { xs: 2, sm: 3 },
                pt: { xs: 6, sm: 7 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "visible",
              }}
            >
              {lightboxExampleRef.current && (
                <Zoom
                  in={Boolean(exampleLightboxCode)}
                  timeout={{ enter: 520, exit: 240 }}
                  style={{
                    transitionDelay: exampleLightboxCode ? "60ms" : "0ms",
                  }}
                  easing={{
                    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
                    exit: "cubic-bezier(0.4, 0, 1, 1)",
                  }}
                >
                  <Box
                    component="img"
                    src={lightboxExampleRef.current.src}
                    alt={lightboxExampleRef.current.altLarge}
                    sx={{
                      display: "block",
                      maxWidth: "100%",
                      maxHeight: "min(82dvh, 860px)",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: 3,
                      boxShadow:
                        "0 4px 6px -1px rgba(0,0,0,0.08), 0 24px 48px -12px rgba(15,23,42,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
                      verticalAlign: "bottom",
                    }}
                  />
                </Zoom>
              )}
            </DialogContent>
          </Dialog>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Photo quality recommendations
          </Typography>
          <Typography
            component="ul"
            sx={{ color: "#4b5563", fontSize: 14, pl: 2.5, mb: 3 }}
          >
            <li>
              Use even lighting; avoid strong backlight that blows out the frame
              or darkens drivetrain details.
            </li>
            <li>
              Keep photos sharp and in focus; take multiple shots and keep the
              clearest one.
            </li>
            <li>
              Keep natural proportions; avoid heavy filters and distortion.
            </li>
            <li>
              For <strong>defect/scratch photos</strong>, take close-ups per
              area and explain details in the listing description.
            </li>
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            4. When creating your listing
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Open{" "}
            <Link to="/post" style={{ color: "#0d9488", fontWeight: 600 }}>
              Post your bike
            </Link>
            . You will see upload slots matching each angle above. Upload each
            photo to the correct slot. Defect photos are optional but
            recommended when there is visible damage.
          </Typography>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link
              to="/post"
              aria-label="Open bike posting page"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#0d9488",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Go to posting page
            </Link>
          </Box>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}
