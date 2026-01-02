import { Press_Start_2P } from 'next/font/google'

export const minecraftFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-minecraft',
})

export const minecraftStyles = `
  /* Import Minecraft fonts */
  @font-face {
    font-family: 'Minecraft';
    src: url('https://db.onlinewebfonts.com/t/6ab539c6fc2b21ff8b2b8d4cde7e1e2f.eot');
    src: url('https://db.onlinewebfonts.com/t/6ab539c6fc2b21ff8b2b8d4cde7e1e2f.eot?#iefix') format('embedded-opentype'),
         url('https://db.onlinewebfonts.com/t/6ab539c6fc2b21ff8b2b8d4cde7e1e2f.woff2') format('woff2'),
         url('https://db.onlinewebfonts.com/t/6ab539c6fc2b21ff8b2b8d4cde7e1e2f.woff') format('woff'),
         url('https://db.onlinewebfonts.com/t/6ab539c6fc2b21ff8b2b8d4cde7e1e2f.ttf') format('truetype'),
         url('https://db.onlinewebfonts.com/t/6ab539c6fc2b21ff8b2b8d4cde7e1e2f.svg#Minecraft') format('svg');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Minecraft-Bold';
    src: url('https://db.onlinewebfonts.com/t/6e0a0e7e70b3e2f8d6b2d4d5e7e1e2f.eot');
    src: url('https://db.onlinewebfonts.com/t/6e0a0e7e70b3e2f8d6b2d4d5e7e1e2f.eot?#iefix') format('embedded-opentype'),
         url('https://db.onlinewebfonts.com/t/6e0a0e7e70b3e2f8d6b2d4d5e7e1e2f.woff2') format('woff2'),
         url('https://db.onlinewebfonts.com/t/6e0a0e7e70b3e2f8d6b2d4d5e7e1e2f.woff') format('woff'),
         url('https://db.onlinewebfonts.com/t/6e0a0e7e70b3e2f8d6b2d4d5e7e1e2f.ttf') format('truetype'),
         url('https://db.onlinewebfonts.com/t/6e0a0e7e70b3e2f8d6b2d4d5e7e1e2f.svg#Minecraft-Bold') format('svg');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Minecraft-Ten';
    src: url('https://db.onlinewebfonts.com/t/1f9c0e7e70b3e2f8d6b2d4d5e7e1e2f.eot');
    src: url('https://db.onlinewebfonts.com/t/1f9c0e7e70b3e2f8d6b2d4d5e7e1e2f.eot?#iefix') format('embedded-opentype'),
         url('https://db.onlinewebfonts.com/t/1f9c0e7e70b3e2f8d6b2d4d5e7e1e2f.woff2') format('woff2'),
         url('https://db.onlinewebfonts.com/t/1f9c0e7e70b3e2f8d6b2d4d5e7e1e2f.woff') format('woff'),
         url('https://db.onlinewebfonts.com/t/1f9c0e7e70b3e2f8d6b2d4d5e7e1e2f.ttf') format('truetype'),
         url('https://db.onlinewebfonts.com/t/1f9c0e7e70b3e2f8d6b2d4d5e7e1e2f.svg#Minecraft-Ten') format('svg');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  /* Text shadow for pixel effect */
  .text-shadow {
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
  }

  .text-shadow-sm {
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
  }

  .text-shadow-lg {
    text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
  }

  /* Font classes */
  .font-minecraft {
    font-family: 'Minecraft', 'Press Start 2P', monospace;
    image-rendering: pixelated;
    letter-spacing: 0.5px;
  }

  .font-minecraft-bold {
    font-family: 'Minecraft-Bold', 'Press Start 2P', monospace;
    font-weight: bold;
    image-rendering: pixelated;
    letter-spacing: 0.5px;
  }

  .font-minecraft-ten {
    font-family: 'Minecraft-Ten', 'Press Start 2P', monospace;
    image-rendering: pixelated;
    letter-spacing: 1px;
  }

  /* Pixelated text effects */
  .pixel-text {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  /* Letter spacing adjustments */
  .tracking-pixel {
    letter-spacing: 0.5px;
  }

  .tracking-pixel-wide {
    letter-spacing: 1px;
  }

  /* Line height for readability */
  .leading-pixel {
    line-height: 1.6;
  }

  .leading-pixel-tight {
    line-height: 1.2;
  }

  /* Anti-aliasing fix */
  .pixel-smooth {
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: grayscale;
  }
`