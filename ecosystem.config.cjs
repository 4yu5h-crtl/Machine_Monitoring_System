
module.exports = {
    apps: [
        {
            name: "paperless-backend",
            script: "./server/index.js",
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "paperless-frontend",
            script: "serve",
            env: {
                PM2_SERVE_PATH: "./dist",
                PM2_SERVE_PORT: 5173,
                PM2_SERVE_SPA: "true",
                PM2_SERVE_HOMEPAGE: "/index.html"
            }
        }
    ]
};
