export const methods = {
    async registerMyConfigImporter380() {
        const { MyConfig380 } = await import('./my-config-3.8');
        return {
            extname: ['.myconfig'],
            importer: MyConfig380,
        };
    },

    async registerMyConfigImporter() {
        return (await import('./my-config-handler')).default;
    },
};