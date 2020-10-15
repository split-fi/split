
import {
  createGlobalStyle,
} from 'styled-components'

// TODO(dave4506) at some point lift styles into theme object
export const LIGHT_THEME = {

}

export const ThemedGlobalStyle = createGlobalStyle`
    @font-face {
        font-family: "San Francisco";
        font-weight: 400;
        src: url("https://applesocial.s3.amazonaws.com/assets/styles/fonts/sanfrancisco/sanfranciscodisplay-regular-webfont.woff");
    }

    body, html, * {
        box-sizing: border-box;
    }
    
    html {
        color: #FFFFFF;
        background-color: #0E2991;
        font-family: San Francisco, Helvetica, Arial;
    }
    body {
        min-height: 100vh;
        margin: 0;
    }
`