'use client';
import React, { useState } from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import Header from "./components/Header";
import Footer from './components/Footer';
import { KeepKeyWalletProvider } from './contexts/WalletProvider';
import { extendTheme } from "@chakra-ui/react";
import HomePage from '.';
import '@fontsource/share-tech-mono';
import { PricesProvider } from './contexts/PricesContext';
import { UserConnectionProvider } from './contexts/UserConnectionContext';
export default function Home() {
  const [selectedChains, setSelectedChains] = useState<string[]>([]);

  const theme = extendTheme({
    styles: {
      global: {
        body: {
          bg: "black",
          height: "100%",
          width: "100%",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          fontFamily: "Share Tech Mono, monospace", // Add this line
        },
        "#root": {
          height: "100%",
          width: "100%",
        },
      },
    },
    fonts: {
      heading: "Share Tech Mono, monospace",
      body: "Share Tech Mono, monospace",
    },
  });

  return (
    <ChakraProvider theme={theme}>
      <UserConnectionProvider>
        <KeepKeyWalletProvider selectedChains={selectedChains}>

          <PricesProvider>
            <Header />
            <HomePage />
            <Footer />
          </PricesProvider>

        </KeepKeyWalletProvider>
      </UserConnectionProvider>
    </ChakraProvider>
  );
};
