import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
    CheckCircleOutlined,
    CarOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";

const FeaturesSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(10, 0),
    backgroundColor: "#f9fafa",
}));

const FeatureCard = styled(Card)({
    width: "100%",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "24px 20px",
    textAlign: "center",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.3s",
    "&:hover": {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    },
});

const IconWrapper = styled(Box)({
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
});

const IconBox = styled(Box)({
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#dff7f3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1ABC9C",
});

const features = [
    {
        title: "36-Point Inspection",
        description: "Every certified bike undergoes rigorous mechanical checks.",
        icon: <CheckCircleOutlined style={{ fontSize: 32 }} />,
    },
    {
        title: "White Glove Delivery",
        description: "Fully insured, professional bike shipping.",
        icon: <CarOutlined style={{ fontSize: 32 }} />,
    },
    {
        title: "Secure Transactions",
        description: "Escrow system ensures safe payments.",
        icon: <SafetyCertificateOutlined style={{ fontSize: 32 }} />,
    },
];

export default function Features() {
    return (
        <FeaturesSection component="section">
            <Container maxWidth="lg">
                <Grid container spacing={2.5}>
                    {features.map((feature, index) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={index} sx={{ display: "flex" }}>
                            <FeatureCard>
                                <CardContent sx={{ p: 0 }}>
                                    <IconWrapper>
                                        <IconBox>{feature.icon}</IconBox>
                                    </IconWrapper>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 1,
                                            color: "#1a1a1a",
                                            fontSize: "1.05rem",
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#6b7280",
                                            fontSize: "0.875rem",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </FeatureCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </FeaturesSection>
    );
}
