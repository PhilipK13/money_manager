/* eslint-disable require-await */
/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

const prod = process.env.NODE_ENV === "production";

const nextConfig = withPWA({
  reactStrictMode: true,
  pwa: {
    disable: prod ? false : true,
    dest: "public",
    runtimeCaching,
  },
});

module.exports = nextConfig;