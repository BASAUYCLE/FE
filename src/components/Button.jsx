import { Button as MUIButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MUIButton)(({ theme, variant: customVariant }) => {
  const baseStyles = {
    borderRadius: 12,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'none',
    gap: theme.spacing(1),
  };

  if (customVariant === 'primary') {
    return {
      ...baseStyles,
      backgroundColor: '#1ABC9C',
      color: 'white',
      '&:hover': {
        backgroundColor: '#16A085',
      },
    };
  }

  if (customVariant === 'outline') {
    return {
      ...baseStyles,
      border: '1px solid #d1d5db',
      color: '#374151',
      backgroundColor: 'white',
      '&:hover': {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
      },
    };
  }

  if (customVariant === 'dark') {
    return {
      ...baseStyles,
      backgroundColor: '#020617',
      color: 'white',
      '&:hover': {
        backgroundColor: '#1a1a1a',
      },
    };
  }

  return baseStyles;
});

export default function Button({
  children,
  variant = "primary",
  icon,
  iconPosition = "left",
  ...props
}) {
  return (
    <StyledButton variant={variant} {...props}>
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </StyledButton>
  );
}
