import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// הגדרות האפליקציה שלנו
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {}, // <--- הנה השורה החדשה שפותרת את השגיאה!
};

export default withPWA(nextConfig);