import { createGlobalStyle } from "styled-components";

// TODO(dave4506) at some point lift styles into theme object
export const LIGHT_THEME = {};

export const ThemedGlobalStyle = createGlobalStyle`
    body, html, * {
        box-sizing: border-box;
    }
    
    html {
        color: #FFFFFF;
        background-color: #0E2991;
        font-family: 'Roboto', Helvetica, Arial;
    }
    body {
        min-height: 100vh;
        margin: 0;
    }
`;
