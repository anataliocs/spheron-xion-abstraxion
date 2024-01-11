
# Spheron XION Abstraxion Reference Implementation

__Goal:__ Integrate Abstraxion and Spheron SDK

Uses the [Spheron Browser SDK](https://docs.spheron.network/sdk/browser/) and [Abstraxion library](https://socket.dev/npm/package/@burnt-labs/abstraxion).

**Basic implementation**
- Store Transaction Hash in IPFS

## Getting Started

### Setup Spheron Access Token and Browser Upload SDK

First, create a [Spheron Access Token](https://docs.spheron.network/rest-api/#creating-an-access-token)

Then we will create a [Spheron upload token server](https://docs.spheron.network/sdk/browser/#server)

Create .env file:
```
SPHERON_ACCESS_TOKEN=
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

