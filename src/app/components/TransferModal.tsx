// Path: src/app/components/trasnferModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Center, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Box, Text, Flex, Spacer, VStack, InputRightAddon, InputGroup } from '@chakra-ui/react';
import { useHandleTransfer } from '../hooks/useTransfer';
import { useKeepKeyWallet } from '../contexts/WalletProvider';
import { useToast } from '@chakra-ui/react';
import { usePrices } from '../contexts/PricesContext';

interface TransferModalProps {
    sendingWallet: string;
    isModalOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
    chain: string;
    symbol: string;
    asset: any;
}


const TransferModal: React.FC<TransferModalProps> = ({ sendingWallet, isModalOpen, setModalOpen, asset, symbol }) => {
    const [amount, setAmount] = useState('');
    const [destinationWallet, setDestinationWallet] = useState('');
    const [memo, setMemo] = useState('');
    const handleTransfer = useHandleTransfer(useKeepKeyWallet().keepkeyInstance);
    const toast = useToast();
    const { prices } = usePrices();
    const [usdAmount, setUsdAmount] = useState('');
    const [isSwitched, setIsSwitched] = useState(false);
    const [lastEdited, setLastEdited] = useState('');


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

    const handleTransferClick = async () => {
        try {
            console.log("asset: ", asset)
            const txHash = await handleTransfer({ asset: asset.symbol, chain: asset.chain, from: sendingWallet, amount: Number(amount), destination: destinationWallet });
            showToast(`Transfer successful! TxHash: ${txHash}`);
        } catch (error) {
            console.error("Transfer failed", error);
            showToast(`Transfer failed: ${error}`);
        }
    };
    const debounce = (func: (...args: any[]) => void, wait: number): ((...args: any[]) => void) => {
        let timeout: NodeJS.Timeout;

        return function executedFunction(...args: any[]): void {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };



    const updateUsdAmount = useCallback(debounce((newAmount: number) => {
        const price = prices[symbol.toUpperCase()] || 0;
        const calculatedUsdAmount = (Number(newAmount) * price).toFixed(2);
        setUsdAmount(calculatedUsdAmount);
    }, 500), [prices, symbol]);

    const updateAmount = useCallback(debounce((newUsdAmount: number) => {
        const price = prices[symbol.toUpperCase()] || 0;
        if (price > 0) {
            const calculatedAmount = (Number(newUsdAmount) / price).toFixed(8);
            setAmount(calculatedAmount);
        }
    }, 500), [prices, symbol]);


    useEffect(() => {
        if (lastEdited === 'amount') {
            const price = prices[symbol.toUpperCase()] || 0;
            const calculatedUsdAmount = (Number(amount) * price).toFixed(2);
            setUsdAmount(calculatedUsdAmount);
        }
    }, [amount, prices, symbol, lastEdited]);

    useEffect(() => {
        if (lastEdited === 'usdAmount') {
            const price = prices[symbol.toUpperCase()] || 0;
            if (price > 0) { // Prevent division by zero
                const calculatedAmount = (Number(usdAmount) / price).toFixed(8);
                setAmount(calculatedAmount);
            }
        }
    }, [usdAmount, prices, symbol, lastEdited]);


    const directUpdateUsdAmount = (newAmount: any) => {
        const price = prices[symbol.toUpperCase()] || 0;
        const calculatedUsdAmount = (Number(newAmount) * price).toFixed(2);
        setUsdAmount(calculatedUsdAmount);
    };

    const directUpdateAmount = (newUsdAmount: any) => {
        const price = prices[symbol.toUpperCase()] || 0;
        if (price > 0) { // Prevent division by zero
            const calculatedAmount = (Number(newUsdAmount) / price).toFixed(8);
            setAmount(calculatedAmount);
        }
    };

    useEffect(() => {
        if (lastEdited === 'amount') {
            directUpdateUsdAmount(amount);
        }
    }, [amount, lastEdited]);
    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <ModalOverlay />
                <ModalContent color="white" background="linear-gradient(to bottom, grey, black)"
                >
                    <ModalHeader>Transfer {symbol}</ModalHeader>
                    <Center>

                        <Text fontWeight={'bold'}>
                            Total Balance:  {asset?.value ? parseFloat(asset.value).toFixed(4) : '0.00'}
                        </Text>
                    </Center>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box w="full">
                                <InputGroup>
                                    <Input
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setLastEdited('amount');
                                        }}
                                        placeholder="Amount in tokens"
                                    />
                                    <InputRightAddon color={"black"} children={symbol} />

                                </InputGroup>

                            </Box>
                            <Box w="full">
                                <InputGroup>
                                    <Input
                                        value={usdAmount}
                                        onChange={(e) => {
                                            setUsdAmount(e.target.value);
                                            setLastEdited('usdAmount');
                                        }}
                                        placeholder="Equivalent USD amount"
                                    />
                                    <InputRightAddon color={"black"} children={"USD"} />
                                </InputGroup>
                            </Box>
                            <Box w="full">
                                <Text mb="8px">Destination Wallet:</Text>
                                <Input
                                    value={destinationWallet}
                                    onChange={(e) => setDestinationWallet(e.target.value)}
                                    placeholder="Destination wallet address"
                                />
                            </Box>
                            <Box w="full">
                                <Text mb="8px">Memo (optional):</Text>
                                <Input
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="Transaction memo"
                                />
                            </Box>
                            {memo === 'CHRIS' &&
                                <Box>
                                    <Center>
                                        <Avatar boxSize={'128px'} src='illithics.png' />
                                    </Center>
                                </Box>
                            }

                        </VStack>

                    </ModalBody>
                    <ModalFooter>
                        <Flex mt="24px" justifyContent="flex-end">
                            <Button
                                mr={3}
                                colorScheme="green"
                                onClick={handleTransferClick}
                            >
                                Transfer
                            </Button>
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );



}
export default TransferModal;
