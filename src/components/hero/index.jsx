import { Link } from "react-router-dom";
import { Box, Container, Typography, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowRightOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Button from "../Button";
import SearchBar from "../searchbar";

import heroBg from "../../assets/home1-logo.png";

const HeroSection = styled(Box)(({ theme }) => ({
    position: "relative",
    minHeight: 560,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    overflow: "visible",
    borderRadius: 24,
    backgroundColor: "#0f172a",
    [theme.breakpoints.down("md")]: {
        minHeight: 520,
    },
    [theme.breakpoints.down("sm")]: {
        minHeight: 480,
    },
}));

/* Single full-cover background (cyclist silhouette + mountains on right) */
const HeroBg = styled(Box)({
    position: "absolute",
    inset: 0,
    zIndex: 0,
    backgroundImage: `url(${heroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    filter: "blur(0.5px)",
    "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(15, 23, 42, 0.4) 100%)",
        pointerEvents: "none",
    },
});

/* Left-to-right dark gradient for text readability */
const HeroOverlay = styled(Box)({
    position: "absolute",
    inset: 0,
    zIndex: 1,
    background:
        "linear-gradient(to right, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.15) 85%, transparent 100%)",
    pointerEvents: "none",
});

const HeroContent = styled(Container)(({ theme }) => ({
    position: "relative",
    zIndex: 10,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(10, 3, 6),
    width: "100%",
    maxWidth: "100%",
    [theme.breakpoints.down("md")]: {
        padding: theme.spacing(7.5, 3, 5),
    },
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(5, 2, 4),
    },
}));

const HeroBadge = styled(Chip)({
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 204, 173, 0.2)",
    border: "1px solid rgba(0, 204, 173, 0.3)",
    color: "#00ccad",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 24,
    marginLeft: 0,
    height: 22,
    borderRadius: 8,
    padding: "0 12px",
    "& .MuiChip-label": {
        padding: "0 4px",
        fontSize: 10,
    },
});

const HeroTitle = styled(Typography)(({ theme }) => ({
    fontSize: 56,
    fontWeight: 800,
    lineHeight: 1.1,
    color: "white",
    marginBottom: 20,
    maxWidth: 560,
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
    [theme.breakpoints.down("md")]: {
        fontSize: 40,
    },
    [theme.breakpoints.down("sm")]: {
        fontSize: 32,
        maxWidth: "100%",
    },
}));

const TitleHighlight = styled("span")({
    color: "#00ccad",
});

const HeroDescription = styled(Typography)(({ theme }) => ({
    fontSize: 18,
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 32,
    maxWidth: 520,
    [theme.breakpoints.down("md")]: {
        fontSize: 16,
    },
    [theme.breakpoints.down("sm")]: {
        fontSize: 15,
        maxWidth: "100%",
    },
}));

const HeroButtons = styled(Box)({
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
});

const SecondaryButton = styled(Button)({
    padding: "14px 28px",
    fontSize: 16,
    fontWeight: 600,
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    "&:hover": {
        background: "rgba(255, 255, 255, 0.15)",
    },
});

/* Floating search bar: centered at bottom, overlaps hero edge, card look */
const SearchWrapper = styled(Box)(({ theme }) => ({
    position: "relative",
    zIndex: 20,
    marginTop: "auto",
    paddingTop: 24,
    paddingBottom: 0,
    marginBottom: -32,
    width: "100%",
    maxWidth: 1160,
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        marginBottom: -24,
    },
    [theme.breakpoints.down("sm")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        marginBottom: -16,
    },
}));

const SearchCard = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: 1160,
    borderRadius: 20,
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    backgroundColor: "#fff",
    [theme.breakpoints.down("sm")]: {
        borderRadius: 16,
    },
}));

const HeroOuter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(6, 3),
    maxWidth: 1280,
    margin: "0 auto",
    width: "100%",
    [theme.breakpoints.up("lg")]: {
        padding: theme.spacing(10, 6),
    },
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(4, 2),
    },
}));

export default function Hero() {
    return (
        <HeroOuter component="section">
            <HeroSection>
                <HeroBg aria-hidden="true" />
                <HeroOverlay />
                <HeroContent>
                    <HeroBadge label="PREMIUM MARKETPLACE" />
                    <HeroTitle variant="h1">
                        Find Your Next <TitleHighlight>Peak Performance.</TitleHighlight>
                    </HeroTitle>
                    <HeroDescription>
                        The most trusted marketplace for modern cyclists. Buy, sell, and get
                        certified expert inspections for high-performance bicycles.
                    </HeroDescription>
                    <HeroButtons>
                        <Link to="/marketplace" style={{ textDecoration: "none" }}>
                            <Button
                                variant="primary"
                                icon={<ArrowRightOutlined />}
                                iconPosition="right"
                                sx={{
                                    padding: "14px 28px",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    backgroundColor: "#00ccad",
                                    color: "#0f172a",
                                    boxShadow: "0 4px 14px rgba(0, 204, 173, 0.4)",
                                    "&:hover": {
                                        backgroundColor: "#00b89a",
                                        color: "#0f172a",
                                        boxShadow: "0 6px 20px rgba(0, 204, 173, 0.45)",
                                    },
                                }}
                            >
                                Explore Marketplace
                            </Button>
                        </Link>
                        <SecondaryButton icon={<CheckCircleOutlined />}>
                            Certified Pre-Owned
                        </SecondaryButton>
                    </HeroButtons>
                </HeroContent>
                <SearchWrapper>
                    <SearchCard>
                        <SearchBar />
                    </SearchCard>
                </SearchWrapper>
            </HeroSection>
        </HeroOuter>
    );
}
