/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
        public: { url: '/', static: true },
        src: { url: '/dist' },
    },
    plugins: [
        '@snowpack/plugin-dotenv',
        '@snowpack/plugin-typescript',
        '@prefresh/snowpack',
        ["@snowpack/plugin-sass", {
            style: "compressed"
        }]
    ],
    routes: [
        /* Enable an SPA Fallback in development: */
        { "match": "routes", "src": ".*", "dest": "/index.html" },
    ],
    optimize: {
        /* Example: Bundle your final build: */
        "bundle": true,
    },
    packageOptions: {
        /* ... */
    },
    devOptions: {
        /* ... */
    },
    buildOptions: {
        /* ... */
    },
    alias: {
        "react": "preact/compat",
        "@app": "./src"
    }
};
