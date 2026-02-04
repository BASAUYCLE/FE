import { Link } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { CloseOutlined } from "@ant-design/icons";
import "./index.css";

export default function WishlistCard({ bike, onRemove }) {
    const badges = Array.isArray(bike.badges)
        ? bike.badges
        : bike.badge
            ? [{ type: "available", label: bike.badge }]
            : [];
    const isSold = bike.status === "sold";
    const brand = bike.brand || bike.category || "";
    const year = bike.year || "";

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove?.(bike.id);
    };

    return (
        <Box className={`wishlist-card ${isSold ? "wishlist-card-sold" : ""}`}>
            <Box className="wishlist-card-image-wrapper">
                <img src={bike.image} alt={bike.name} className="wishlist-card-image" />
                {!isSold && (
                    <Box className="wishlist-card-badges">
                        {badges.map((b) => (
                            <span
                                key={b}
                                className={`wishlist-card-badge wishlist-card-badge-${b.type}`}
                            >
                                {b.label}
                            </span>
                        ))}
                    </Box>
                )}
                {isSold && (
                    <Box className="wishlist-card-sold-overlay">RECENTLY SOLD</Box>
                )}
                <button
                    type="button"
                    className="wishlist-card-remove"
                    onClick={handleRemove}
                    aria-label="Remove from wishlist"
                >
                    <CloseOutlined style={{ fontSize: 14 }} />
                </button>
            </Box>
            <Box className="wishlist-card-body">
                <Typography className="wishlist-card-name">{bike.name}</Typography>
                <Typography className="wishlist-card-brand">
                    {brand}
                    {year ? ` · ${year}` : ""}
                </Typography>
                <Typography
                    className={`wishlist-card-price ${isSold ? "wishlist-card-price-sold" : ""}`}
                >
                    {bike.price}
                    {bike.originalPrice && !isSold && (
                        <span className="wishlist-card-original-price">
                            {bike.originalPrice}
                        </span>
                    )}
                </Typography>
                <Box className="wishlist-card-specs">
                    {bike.specs?.frame && (
                        <Typography variant="body2">FRAME: {bike.specs.frame}</Typography>
                    )}
                    {bike.specs?.groupset && (
                        <Typography variant="body2">
                            GROUPSET: {bike.specs.groupset}
                        </Typography>
                    )}
                    {bike.specs?.size && (
                        <Typography variant="body2">SIZE: {bike.specs.size}</Typography>
                    )}
                    {!bike.specs?.frame &&
                        !bike.specs?.groupset &&
                        bike.specs?.weight && (
                            <Typography variant="body2">
                                WEIGHT: {bike.specs.weight}
                            </Typography>
                        )}
                    {!bike.specs?.frame && bike.specs?.groupset && (
                        <Typography variant="body2">
                            GROUPSET: {bike.specs.groupset}
                        </Typography>
                    )}
                </Box>
                {isSold ? (
                    <Button
                        variant="contained"
                        className="wishlist-card-action wishlist-card-action-disabled"
                        disabled
                    >
                        NOT AVAILABLE
                    </Button>
                ) : (
                    <Link
                        to={`/product/${bike.id}`}
                        style={{ textDecoration: "none", display: "block" }}
                    >
                        <Button
                            variant="contained"
                            className="wishlist-card-action"
                            fullWidth
                        >
                            VIEW DETAILS
                        </Button>
                    </Link>
                )}
            </Box>
        </Box>
    );
}
