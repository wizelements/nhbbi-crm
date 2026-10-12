/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  serverExternalPackages: ['@libsql/client'],
  experimental: {
    // Android/Termux arm64 has no native Next.js SWC binary; force WASM-first.
    useWasmBinary: true,
    // Disable build workers / parallel traces that fork without wasm env.
    webpackBuildWorker: false,
    workerThreads: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
}

module.exports = nextConfig
