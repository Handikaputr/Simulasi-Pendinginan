// tailwind.config.js
module.exports = {
 
  theme: {
    // ...
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    // ...
  ],
}