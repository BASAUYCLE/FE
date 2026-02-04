import { useState } from "react";
import { Box, Container, ToggleButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Terrain as TerrainIcon,
  Route as RouteIcon,
  Grain as GrainIcon,
  ElectricBike as ElectricBikeIcon,
} from "@mui/icons-material";
import "./index.css";

const categories = [
  { id: "all", label: "All Bikes" },
  { id: "mountain", label: "Mountain", Icon: TerrainIcon },
  { id: "road", label: "Road", Icon: RouteIcon },
  { id: "gravel", label: "Gravel", Icon: GrainIcon },
  { id: "ebikes", label: "E-Bikes", Icon: ElectricBikeIcon },
];

const FilterSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(7, 0, 4),
  backgroundColor: "#f9fafa",
}));

const FilterContainer = styled(Container)({
  maxWidth: 1160,
});

const PillChipsWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: theme.spacing(1.5),
}));

const StyledToggleButton = styled(ToggleButton)(() => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 9999,
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  border: "1px solid #e5e7eb",
  backgroundColor: "#fff",
  color: "#111827",
  transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
  "&.Mui-selected": {
    backgroundColor: "#00ccad",
    color: "#0f172a",
    borderColor: "#00ccad",
    "&:hover": {
      backgroundColor: "#00b89a",
      borderColor: "#00b89a",
    },
  },
  "&:hover": {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
  },
}));

export default function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleSelect = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <FilterSection component="section">
      <FilterContainer>
        <PillChipsWrapper component="div" role="group" aria-label="bike category filter">
          {categories.map(({ id, label, Icon }) => (
            <StyledToggleButton
              key={id}
              value={id}
              selected={activeCategory === id}
              onClick={() => handleSelect(id)}
              aria-pressed={activeCategory === id}
            >
              {Icon && <Icon />}
              {label}
            </StyledToggleButton>
          ))}
        </PillChipsWrapper>
      </FilterContainer>
    </FilterSection>
  );
}
