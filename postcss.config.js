// // ORIGINAL CONFIG TAILWIND v4
// // to be able to produce correct style, REFACTOR all sass-like nesting syntax to native css nesting!
// export default {
//   plugins: {
//     '@tailwindcss/postcss': {},
// }

// THIS IS WORKAROUND
// To be able to keep using sass-like syntax and get resulted tailwind classes correctly
// WARN: Have only tested this in development mode. Use in production with caution!
export default {
  plugins: {
    'postcss-nested': {}, // allow transform for sass-like syntax to regular css, need to be placed BEFORE @tailwind/postcss
    '@tailwindcss/postcss': {
      // need to set `optimize` to `false`,
      // this will prevent unexpected behavior when tailwind process the css
      optimize: false,
    },
    'postcss-lightningcss': { // process the postcss result with lightningcss
      minify: true,
    }
  },
}
