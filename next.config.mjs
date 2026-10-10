/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  // Las fuentes del PDF se leen del disco en tiempo de ejecución: inclúyelas en el bundle de la función.
  outputFileTracingIncludes: { "/api/pdf": ["./assets/fonts/**"] },
};
export default nextConfig;
