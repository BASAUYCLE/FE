import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const CTASection = styled(Box)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(12.5, 0),
    backgroundColor: '#00ccad',
    overflow: 'hidden',
}));

const BackgroundShape = styled(Box)({
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 600,
    height: 600,
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(30%, 30%)',
});

const CTAContainer = styled(Container)({
    position: 'relative',
    zIndex: 10,
    maxWidth: 1160,
});

const CTAContent = styled(Box)({
    textAlign: 'center',
    maxWidth: 800,
    margin: '0 auto',
});

const CTATitle = styled(Typography)(({ theme }) => ({
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#1a1a1a',
    marginBottom: theme.spacing(2.5),
    [theme.breakpoints.down('md')]: {
        fontSize: 36,
    },
}));

const CTADescription = styled(Typography)(({ theme }) => ({
    fontSize: 18,
    lineHeight: 1.6,
    color: 'rgba(15, 23, 42, 0.85)',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
        fontSize: 16,
    },
}));

const CTAButton = styled(Button)({
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 700,
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    '&:hover': {
        backgroundColor: '#1e293b',
        color: '#fff',
    },
});

export default function CTA() {
    const navigate = useNavigate();

    return (
        <CTASection component="section">
            <BackgroundShape />
            <CTAContainer>
                <CTAContent>
                    <CTATitle variant="h2">
                        Ready to upgrade your ride?
                        <br />
                        Sell your bike in minutes.
                    </CTATitle>
                    <CTADescription>
                        List your bike for free and reach thousands of verified buyers in our premium cycling community.
                    </CTADescription>
                    <CTAButton
                        variant="dark"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/post')}
                    >
                        List Your Bike Now
                    </CTAButton>
                </CTAContent>
            </CTAContainer>
        </CTASection>
    );
}
