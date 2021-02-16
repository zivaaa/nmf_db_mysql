import {BIND_DB_MIGRATOR} from "../consts.js";

/**
 * @type {nmf.Action}
 */
const action = {
    name: "db.migrate",
    description: "запустить миграцию бд",
    async fn(app) {
        const migrator = /** @type {nmf.Migrator} */ app.ctx.fetch(BIND_DB_MIGRATOR);
        await migrator.up();
        return true;
    }
}

export default action;