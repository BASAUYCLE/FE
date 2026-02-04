import bikeTarmac from "../assets/bike-tarmac-sl7.png";
import santaCruzNomadCC from "../assets/SantaCruzNomaCC.png";
import canyonGrizlCFSL from "../assets/CanyonGrizlCFSL.jpg";
import specializedTurboLevo from "../assets/SpecializedTurboLevo.png";

export const marketplaceBikes = [
  { id: 1, name: "2023 Trek Emonda SLR 7", price: "$4,250", category: "ROAD / CARBON", image: bikeTarmac, badge: "VERIFIED", specs: { weight: "7.2kg", groupset: "SRAM Force" }, location: "Portland, OR", size: "54cm" },
  { id: 2, name: "Santa Cruz Nomad CC", price: "$5,800", category: "MTB / FULL SUSP.", image: santaCruzNomadCC, badge: "CERTIFIED", specs: { weight: "13.5kg", groupset: "FOX Factory" }, location: "San Francisco, CA", size: "Large" },
  { id: 3, name: "Canyon Grizl CF SL", price: "$2,900", category: "E-GRAVEL", image: canyonGrizlCFSL, badge: "NEW", specs: { weight: "9.8kg", groupset: "Shimano GRX" }, location: "Seattle, WA", size: "56cm" },
  { id: 4, name: "Specialized Turbo Levo", price: "$8,100", category: "E-MTB / ELECTRIC", image: specializedTurboLevo, badge: "VERIFIED", specs: { weight: "22.5kg", groupset: "Brose 2.2", motorPower: "700Wh" }, location: "Denver, CO", size: "Large" },
  { id: 5, name: "2024 Specialized Tarmac SL7", price: "$6,200", category: "ROAD / CARBON", image: bikeTarmac, badge: "CERTIFIED", specs: { weight: "7.0kg", groupset: "Dura-Ace Di2" }, location: "Austin, TX", size: "52cm" },
  { id: 6, name: "Trek Domane SLR 9", price: "$9,500", category: "ROAD RACE", image: canyonGrizlCFSL, badge: "VERIFIED", specs: { weight: "7.4kg", groupset: "SRAM Red" }, location: "Chicago, IL", size: "54cm" },
];

export const TOTAL_MARKETPLACE_COUNT = 1402;
