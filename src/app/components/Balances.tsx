// path: src/app/components/Balances.tsx
import React, { useState, useEffect } from "react";
import { Tooltip, Center, Box, Flex, Spacer, Text, HStack, Button, TableContainer, Table, Tr, Th, Tbody, Thead, Td, Avatar, Badge, Input } from "@chakra-ui/react";
import { useKeepKeyWallet } from "../contexts/WalletProvider";
import { handleCopy } from "../utils/handleCopy";
import { FaCopy } from "react-icons/fa";
import { useToast } from "@chakra-ui/react";
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import TransferModal from "./TransferModal";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { usePrices } from "../contexts/PricesContext";

interface Balance {
    symbol: string;
    value: string;
    chain: string;
    address: any;
    usdValue?: number | null;
    price?: number | null;
}


type SortOrder = {
    column: string | null;
    direction: 'none' | 'asc' | 'desc';
};


const Balances: React.FC = () => {
    const { keepkeyInstance } = useKeepKeyWallet();
    const toast = useToast();
    const [balances, setBalances] = useState<Balance[]>([]);
    const [asset, setAsset] = useState<any>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [sendingWallet, setSendingWallet] = useState("");
    const [chain, setChain] = useState("");
    const [symbol, setSymbol] = useState("");
    const { prices, fetchPrices } = usePrices();


    const chainColorMap = {
        BTC: 'orange.400', // Bitcoin
        ETH: 'blue.200', // Ethereum
        USDT: 'green.500', // Tether
        THOR: 'teal.400', // ThorChain
        LTC: 'blue.100',  // Litecoin
        DOGE: 'yellow.400', // Dogecoin
        CACAO: 'brown.400', // Cacao
        MAYA: 'brown.400', // Cacao
        // Add more chains and their corresponding colors as needed
    };


    useEffect(() => {
        if (keepkeyInstance) {
            const loadBalances = async () => {
                const newBalances: Balance[] = [];
                Object.keys(keepkeyInstance).forEach((key) => {
                    keepkeyInstance[key].wallet.balance.forEach((balance: any) => {
                        if (balance.ticker) {
                            newBalances.push({
                                chain: balance.chain,
                                symbol: balance.ticker,
                                value: balance.getValue('string'),
                                address: keepkeyInstance[key].wallet.address,
                            });
                        } else {
                            console.error("Bad Balance: ", balance);
                        }
                    });
                });

                const updatedBalances = newBalances.map(balance => {
                    const price = prices[balance.symbol.toUpperCase()] || 0; // Using global prices
                    const usdValue = price * parseFloat(balance.value);
                    return {
                        ...balance,
                        usdValue: isNaN(usdValue) ? null : usdValue, // Handle potential NaN values
                        price: price,
                    };
                });

                setBalances(updatedBalances);
            };

            loadBalances();
        }
    }, [keepkeyInstance, prices]);

    const totalUsdValue = balances.reduce((acc: number, balance: Balance) => {
        return acc + (balance.usdValue || 0);
    }, 0);


    const showToast = (message: string) => {
        toast({
            title: message,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
            variant: "subtle",
        });
    };
    const groupedBalances: { [key: string]: Balance[] } = balances.reduce((acc, balance) => {
        // Use the chain as the key for grouping
        if (!acc[balance.chain]) {
            acc[balance.chain] = [];
        }
        acc[balance.chain].push(balance);
        return acc;
    }, {} as { [key: string]: Balance[] });


    const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | "none">("none");

    const sortBalancesByUsdValue = () => {
        const sortedBalances = [...balances]; // Create a shallow copy to avoid directly mutating state
        if (sortDirection === "ascending") {
            sortedBalances.sort((a, b) => (a.usdValue || 0) - (b.usdValue || 0));
        } else if (sortDirection === "descending") {
            sortedBalances.sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
        }
        // If sortDirection is "none", no need to sort the balances
        return sortedBalances;
    };

    const toggleSortDirection = () => {
        setSortDirection((currentDirection) => {
            switch (currentDirection) {
                case "none":
                    return "ascending";
                case "ascending":
                    return "descending";
                case "descending":
                    return "none";
                default:
                    return "none";
            }
        });
    };


    return (
        <Flex
            align="center"
            justify="center"
            p={4}
            background="linear-gradient(to bottom, grey, black)"
            sx={{ fontFamily: "'Share Tech Mono', monospace" }}
            w="full"
        >
            <Box >
                <Center mb="4">
                    <Badge
                        background="white" color="white"
                        p={4}
                        borderRadius="lg"
                        mb={4}
                        border="2px solid black"
                        boxShadow="lg"
                        textAlign="center"
                    >
                        <Text color={"black"} fontSize="xl" fontWeight="bold" >
                            Total Balance: {totalUsdValue.toFixed(2)} USD
                        </Text>
                    </Badge>
                </Center>
                <Spacer />
                {/* may be I can pass the whole balance object here, instead of prop by prop */}
                <TransferModal
                    isModalOpen={isModalOpen}
                    setModalOpen={setModalOpen} // Pass setModalOpen as a prop
                    sendingWallet={sendingWallet}
                    asset={asset}
                    symbol={symbol}
                    chain={chain}
                />
                <Center>

                    <TableContainer
                        border={"2px solid white"}
                        borderRadius={"20px"}
                        w={"800px"}
                    >
                        <Accordion allowMultiple>
                            {Object.entries(groupedBalances).map(([chain, tokens]) => (
                                <AccordionItem key={chain}>
                                    <h1>
                                        <AccordionButton>
                                            <Box flex="1" textAlign="left" color={"white"}>
                                                <Flex justifyContent={"space-between"}>
                                                    <Box>
                                                        <Avatar
                                                            key={chain}
                                                            size="xs"
                                                            src={`https://pioneers.dev/coins/${COIN_MAP_LONG[chain as keyof typeof COIN_MAP_LONG]}.png`}
                                                            mr={2}
                                                        />
                                                        {chain}
                                                    </Box>
                                                    <Badge
                                                        borderRadius={"10px"}
                                                        border={"2px solid black"}
                                                        bg={"white"}
                                                        color={"black"}
                                                        fontSize={"26px"}
                                                    >
                                                        $
                                                        {tokens
                                                            .reduce(
                                                                (acc: number, token: any) =>
                                                                    acc + (token.usdValue || 0),
                                                                0
                                                            )
                                                            .toFixed(2)}
                                                    </Badge>
                                                </Flex>
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h1>
                                    <AccordionPanel pb={4}>
                                        <Table variant="">
                                            <Thead color={"white"}>
                                                <Tr>
                                                    <Th>Symbol</Th>
                                                    <Th>Amount</Th>
                                                    <Th>USD Value</Th>
                                                    <Th>Address</Th>
                                                    <Th></Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody color={"blue.200"}>
                                                {tokens.map((token, index) => (
                                                    <Tr color={chainColorMap[chain as keyof typeof chainColorMap] || 'gray'} key={index}>
                                                        <Td>{token.symbol}</Td>
                                                        <Td>
                                                            <Box w={"100px"}>{token.value}</Box>
                                                        </Td>
                                                        <Td>${token.usdValue ? token.usdValue.toFixed(2) : "0.00"}</Td>
                                                        <Td>
                                                            <Flex align="center">
                                                                <Button
                                                                    size="sm"
                                                                    bg={"transparent"}
                                                                    onClick={() => {
                                                                        console.log(token);
                                                                        navigator.clipboard.writeText(token.address);
                                                                        showToast("Address copied to clipboard");
                                                                    }}
                                                                    _hover={{ bg: "transparent" }}
                                                                >
                                                                    <FaCopy color="white" />
                                                                </Button>
                                                                <Input
                                                                    value={token.address}
                                                                    isReadOnly
                                                                    borderRadius={"10px"}
                                                                    size="sm"
                                                                    height={"30px"}
                                                                    w={"200px"}
                                                                    mr={2}
                                                                    padding={2}
                                                                />
                                                            </Flex>
                                                        </Td>
                                                        <Td>
                                                            <Button
                                                                size="sm"
                                                                bg={"green.200"}
                                                                color={"black"}
                                                                onClick={() => {
                                                                    setAsset(token);
                                                                    setModalOpen(true);
                                                                    setSendingWallet(token.address);
                                                                    setChain(token.chain);
                                                                    setSymbol(token.symbol);
                                                                }}
                                                            >
                                                                Send
                                                            </Button>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </TableContainer>
                </Center>

            </Box>
        </Flex >
    );
};

export default Balances;
