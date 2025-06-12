declare module "cc" {
    namespace AssetManager {
        interface Downloader {
            /**删除downloadScript中的缓存，具体实现位于构建后的engin-adapter.js中 */
            undownloadBundleScriptCache: (bundleName: string) => void
            /**
             * Version information of all bundles.
             * @engineInternal
             */
            bundleVers: Record<string, string> | null;
        }
    }
}