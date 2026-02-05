import { Link, useNavigate } from "react-router-dom";
import { Card, Tag, Button, Space, Typography } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  AppstoreOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import "./index.css";
import { useWishlist } from "../../contexts/WishlistContext";
import { useOrders } from "../../contexts/OrderContext";
import { useAuth } from "../../contexts/AuthContext";

export default function BikeCard({ bike }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addOrder } = useOrders();
  const isLoggedIn = isAuthenticated?.() ?? !!user;
  const inWishlist = isInWishlist(bike.id);

  const isOwnListing =
    bike.sellerId != null &&
    user &&
    (bike.sellerId == user.id ||
      bike.sellerId == user.userId ||
      bike.sellerId == user.user_id ||
      bike.sellerId === user.email);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnListing) return;
    if (!isLoggedIn) {
      message.info("Please sign in to use wishlist");
      navigate("/login");
      return;
    }
    if (inWishlist) {
      removeFromWishlist(bike.id);
    } else {
      addToWishlist(bike);
    }
  };

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addOrder(bike);
    navigate("/orders");
  };

  const getBadgeStyle = (badge) => {
    const styles = {
      "NEW ARRIVAL": { backgroundColor: "#FAD02E", color: "#0f172a" },
      NEW: { backgroundColor: "#00a99d", color: "#fff" },
      INSPECTED: { backgroundColor: "#00a99d", color: "#fff" },
      "TOP RATED": { backgroundColor: "#00a99d", color: "#fff" },
      VERIFIED: { backgroundColor: "#FAD02E", color: "#0f172a" },
      CERTIFIED: { backgroundColor: "#00a99d", color: "#fff" },
    };
    return styles[badge] || { backgroundColor: "#1a1a1a", color: "#fff" };
  };

  return (
    <Card
      className="bike-card"
      hoverable
      style={{
        borderRadius: 16,
        overflow: "visible",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.3s, transform 0.3s",
      }}
      cover={
        <div
          className="bike-card-image-wrapper"
          style={{
            position: "relative",
            aspectRatio: "4 / 3",
            overflow: "hidden",
            backgroundColor: "#f3f4f6",
          }}
        >
          <img
            src={bike.image}
            alt={bike.name}
            className="bike-card-image"
            referrerPolicy="no-referrer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              transition: "transform 0.3s",
            }}
          />
          {bike.badge && (
            <Tag
              className="bike-card-badge-tag"
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                zIndex: 1,
                ...getBadgeStyle(bike.badge),
              }}
            >
              {bike.badge}
            </Tag>
          )}
          {!isOwnListing && (
            <Button
              type="text"
              icon={inWishlist ? <HeartFilled /> : <HeartOutlined />}
              className={`bike-card-favorite ${inWishlist ? "in-wishlist" : ""}`}
              aria-label={
                inWishlist ? "Remove from favorites" : "Add to favorites"
              }
              onClick={handleFavoriteClick}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            />
          )}
        </div>
      }
      styles={{
        body: {
          padding: 24,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
        },
      }}
    >
      <Typography.Text className="bike-card-category">
        {bike.category}
      </Typography.Text>
      <Typography.Text className="bike-card-price">
        {bike.price}
      </Typography.Text>
      <Typography.Text className="bike-card-name">{bike.name}</Typography.Text>
      <Space className="bike-card-specs" size="middle" wrap>
        {bike.specs.weight && (
          <Space size={6} className="bike-card-spec">
            <AppstoreOutlined />
            <Typography.Text>{bike.specs.weight}</Typography.Text>
          </Space>
        )}
        {bike.specs.groupset && (
          <Space size={6} className="bike-card-spec">
            <SettingOutlined />
            <Typography.Text>{bike.specs.groupset}</Typography.Text>
          </Space>
        )}
        {bike.specs.motorPower && (
          <Space size={6} className="bike-card-spec">
            <ThunderboltOutlined />
            <Typography.Text>{bike.specs.motorPower}</Typography.Text>
          </Space>
        )}
      </Space>
      <div className="bike-card-actions">
        {isOwnListing ? (
          <Link to="/manage-listings" className="bike-card-actions-link">
            <Button
              type="default"
              className="bike-card-btn bike-card-view-details"
              style={{ width: "100%" }}
            >
              Your listing
            </Button>
          </Link>
        ) : (
          <Button
            type="primary"
            onClick={handleBuy}
            className="bike-card-btn bike-card-buy-now"
          >
            Buy Now
          </Button>
        )}
        <Link to={`/product/${bike.id}`} className="bike-card-actions-link">
          <Button
            type="primary"
            className="bike-card-btn bike-card-view-details"
          >
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
