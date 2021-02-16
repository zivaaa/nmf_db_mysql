import {BIND_DB_MIGRATOR} from "../consts.js";

/**
 * @type {nmf.Action}
 */
const action = {
    name: "db.migrate.down.all",
    description: "откат всех миграций",
    async fn(app) {
        const migrator = /** @type {nmf.Migrator} */ app.ctx.fetch(BIND_DB_MIGRATOR);
        await migrator.down(true);
        return true;
    }
}

export default action;