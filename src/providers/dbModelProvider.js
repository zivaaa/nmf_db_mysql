import {DBModelLoader} from "../DBModelLoader.js";
import {BIND_DB_LOADER} from "../consts.js";

/**
 * @type {nmf.Provider}
 */
export const dbModelProvider = {
    async bind(app) {
        const loader = new DBModelLoader(app);
        await loader.bind();
        app.ctx.bind(BIND_DB_LOADER, loader);
    },
    async resolve(app) {
        const loader = app.ctx.fetch(BIND_DB_LOADER);
        await loader.resolve();
    }
}
