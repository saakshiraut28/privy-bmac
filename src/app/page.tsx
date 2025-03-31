/** @format */

// app/page.tsx
"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { parseEther } from "viem";
import { MessageStorageABI, type Message } from "../contract/abi";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

const CONTRACT_ADDRESS = "0x102fFED303851eeD8185E3EA8D291820009CfD3e";

export default function MessageApp() {
  const { login, logout, authenticated, ready, user } = usePrivy();
  const { isConnected } = useAccount();
  const { writeContract, isPending, isSuccess, reset } = useWriteContract();

  const { data: allMessages } = useReadContract({
    abi: MessageStorageABI,
    address: CONTRACT_ADDRESS,
    functionName: "getAllMessages",
  });

  const { data: balance } = useReadContract({
    abi: MessageStorageABI,
    address: CONTRACT_ADDRESS,
    functionName: "getBalance",
  });

  // Reset form after successful transaction
  useEffect(() => {
    if (isSuccess) {
      const form = document.getElementById("messageForm") as HTMLFormElement;
      if (form) form.reset();
      reset();
    }
  }, [isSuccess, reset]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    const ethAmount = formData.get("ethAmount") as string;

    if (!message || !ethAmount) return;

    try {
      await writeContract({
        abi: MessageStorageABI,
        address: CONTRACT_ADDRESS,
        functionName: "pay",
        args: [message],
        value: parseEther(ethAmount),
      });
    } catch (error: any) {
      console.error("Transaction failed:", error);
      alert(`Error: ${error.shortMessage || error.message}`);
    }
  };

  useEffect(() => {
    if (authenticated && user) {
      const hasEmbeddedWallet = !!user.linkedAccounts.find(
        (account) =>
          account.type === "wallet" &&
          account.walletClientType === "privy" &&
          account.chainType === "ethereum"
      );
      console.log("Has Embedded Wallet ", hasEmbeddedWallet);
      console.log("Authenticated User: ", user);
    }
  }, [authenticated, user]); // This will run whenever authenticated or user changes

  const messages = (allMessages as Message[]) || [];
  const contractBalance = balance ? balance.toString() : "0";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Buy Me a Coffee</h1>
          {/* Any inbuilt component is not provided for connect button */}
          {ready && (
            <div>
              {authenticated ? (
                <button
                  onClick={() => logout()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => login()}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          )}
        </div>

        {authenticated && isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Message Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl text-black font-semibold mb-4">
                Send a Message with Coffee
              </h2>
              <form id="messageForm" onSubmit={handleSendMessage}>
                <div className="mb-4">
                  <textarea
                    name="message"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    rows={3}
                    placeholder="Write your message here"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Amount in ETH (any value welcome)
                  </label>
                  <input
                    type="number"
                    name="ethAmount"
                    min="0.000001"
                    step="0.000001"
                    defaultValue="0.001"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:opacity-50"
                >
                  {isPending ? "Sending..." : "Send Coffee"}
                </button>
              </form>
            </div>

            {/* Messages Display */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md text-black">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Coffee Messages</h2>
                <div className="text-gray-600">
                  Total Coffee Fund: {contractBalance} ETH
                </div>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between">
                        <span className="font-medium">{msg.sender}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(
                            Number(msg.timestamp) * 1000
                          ).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No coffee messages yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-xl text-gray-700 mb-4">
              Connect your wallet to buy me a coffee
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
