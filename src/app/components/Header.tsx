import React from "react";
import { Box, Flex, Spacer, Image } from "@chakra-ui/react";
import ConnectKK from "./ConnectKKButton";



const Header = () => {
    return (
        <Flex align="center" justify="center" p={4} bgGradient="linear(to-r, black, grey)">

            <Box>
                <ConnectKK />
            </Box>
        </Flex>
    );
};


export default Header;
