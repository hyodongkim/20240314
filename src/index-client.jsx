import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './component/app';
import './index.css';

hydrateRoot(
    document.querySelector("#root"),
    <React.StrictMode>
        <ChakraProvider>
            <App/>
        </ChakraProvider>
    </React.StrictMode>
)