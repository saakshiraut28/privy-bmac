/** @format */

"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider, http } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";


export default function Provider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_PRIVY_APPID || "";
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENTID || "";

  // Create wagmi config
  const config = createConfig({ 
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });

  // Create a client for React Query
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={projectId}
          clientId={clientId}
          config={{
            // Customize Privy's appearance in your app
            appearance: {
              theme: "light",
              accentColor: "#676FFF",
              logo: "https://your-logo-url",
              showWalletLoginFirst: true, // Shows the Wallet options followed by Social Login
              landingHeader: "Welcome to Demo Privy App", // We can customize the title text also
            },
            // Create embedded wallets for users who don't have a wallet
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
            },
          }}
        >
          {children}
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
