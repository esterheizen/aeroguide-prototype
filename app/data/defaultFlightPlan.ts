import { FlightPlan } from "@/app/types/flightPlan";

/** Default patrol route centred on the simulation start position (Melbourne). */
export const DEFAULT_FLIGHT_PLAN: FlightPlan = {
  id: "MEL-PATROL-01",
  name: "Melbourne CBD Patrol",
  waypoints: [
    {
      id: "WP0",
      name: "DEP Melbourne",
      position: { latitude: -37.8136, longitude: 144.9631 },
      altitude: 500,
      type: "departure",
    },
    {
      id: "WP1",
      name: "North East",
      position: { latitude: -37.805, longitude: 144.975 },
      altitude: 550,
      type: "enroute",
    },
    {
      id: "WP2",
      name: "North West",
      position: { latitude: -37.798, longitude: 144.965 },
      altitude: 600,
      type: "enroute",
    },
    {
      id: "WP3",
      name: "South West",
      position: { latitude: -37.808, longitude: 144.952 },
      altitude: 550,
      type: "enroute",
    },
    {
      id: "WP4",
      name: "ARR Melbourne",
      position: { latitude: -37.8136, longitude: 144.9631 },
      altitude: 500,
      type: "arrival",
    },
  ],
};
