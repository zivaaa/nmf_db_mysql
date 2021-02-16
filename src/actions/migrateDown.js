import {BIND_DB_MIGRATOR} from "../consts.js";

/**
 * @type {nmf.Action}
 */
const action = {
    name: "db.migrate.down",
    description: "откатить миграцию, если нужно откатить все то --all",
    async fn(app) {
        const migrator = /** @type {nmf.Migrator} */ app.ctx.fetch(BIND_DB_MIGRATOR);
        await migrator.down(app.tools.hasArg("all"));
        return true;
    }
}

export default action;