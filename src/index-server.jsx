import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChakraProvider } from '@chakra-ui/react';
import App from './component/app';

export function render(){
    let html = renderToString(
        <React.StrictMode>
            <ChakraProvider>
                <App/>
            </ChakraProvider>
        </React.StrictMode>
    );
    return { html };
}