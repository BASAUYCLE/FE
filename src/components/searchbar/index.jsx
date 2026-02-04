import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input, Select, Button, Typography, ConfigProvider } from "antd";
import {
    SearchOutlined,
    CalendarOutlined,
    DollarCircleOutlined,
} from "@ant-design/icons";
import { BIKE_TYPE_OPTIONS } from "../../constants/bikeTypes";
import "./index.css";

const { Option } = Select;

const BIKE_TYPE_CHOICES = ["All Types", ...BIKE_TYPE_OPTIONS.map((o) => o.value)];

export default function SearchBar() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const [bikeType, setBikeType] = useState("All Types");
    const [priceRange, setPriceRange] = useState("Any Price");
    const priceRanges = [
        "Any Price",
        "Under $2,000",
        "$2,000 - $5,000",
        "$5,000 - $10,000",
        "Over $10,000",
    ];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchValue.trim()) params.set("q", searchValue.trim());
        if (bikeType && bikeType !== "All Types")
            params.set("type", bikeType);
        if (priceRange && priceRange !== "Any Price")
            params.set("price", priceRange);
        navigate(`/marketplace${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const customTheme = {
        token: {
            borderRadius: 8,
            fontSize: 13,
        },
        components: {
            Input: {
                paddingBlock: 6,
                paddingInline: 12,
                controlHeight: 38,
            },
            Select: {
                paddingBlock: 6,
                paddingInline: 12,
                controlHeight: 38,
            },
            Button: {
                controlHeight: 38,
                paddingBlock: 6,
                paddingInline: 16,
            },
        },
    };

    return (
        <ConfigProvider theme={customTheme}>
            <div className="search-bar">
                <div className="search-bar-grid">
                    <div className="search-bar-input-wrapper">
                        <Typography.Text className="search-bar-label">
                            SEARCH ANYTHING
                        </Typography.Text>
                        <Input
                            prefix={
                                <SearchOutlined style={{ color: "#20c997", fontSize: 14 }} />
                            }
                            placeholder="Brand or model..."
                            size="middle"
                            style={{ borderRadius: 8 }}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onPressEnter={handleSearch}
                        />
                    </div>

                    <div className="search-bar-select-wrapper">
                        <Typography.Text className="search-bar-label">
                            Bike Type
                        </Typography.Text>
                        <Select
                            value={bikeType}
                            onChange={setBikeType}
                            size="middle"
                            style={{ width: "100%", borderRadius: 8 }}
                            suffixIcon={
                                <CalendarOutlined style={{ color: "#9ca3af", fontSize: 12 }} />
                            }
                        >
                            {BIKE_TYPE_CHOICES.map((type) => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="search-bar-select-wrapper">
                        <Typography.Text className="search-bar-label">
                            PRICE RANGE
                        </Typography.Text>
                        <Select
                            value={priceRange}
                            onChange={setPriceRange}
                            size="middle"
                            style={{ width: "100%", borderRadius: 8 }}
                            suffixIcon={
                                <DollarCircleOutlined
                                    style={{ color: "#9ca3af", fontSize: 12 }}
                                />
                            }
                        >
                            {priceRanges.map((range) => (
                                <Option key={range} value={range}>
                                    {range}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <Button
                        type="primary"
                        size="middle"
                        block
                        style={{
                            backgroundColor: "#171D2F",
                            borderColor: "#171D2F",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: "auto",
                        }}
                        onClick={handleSearch}
                    >
                        Find My Ride
                    </Button>
                </div>
            </div>
        </ConfigProvider>
    );
}
