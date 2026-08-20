import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// הגדרות האפליקציה שלנו
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // מבטל את ה-PWA בזמן פיתוח כדי שלא יפריע לנו
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);