/**
 * @type {nmf.Provider}
 */
import {BIND_DB_MIGRATOR, BIND_DB_SEEDER, BIND_DB_SOURCE} from "../consts.js";
import {DB} from "../DB.js";
import {Migrator} from "../Migrator.js";
import {Seeder} from "../Seeder.js";
import {BIND_ACTION_MANAGER} from "nmf/src/services/action/consts.mjs";
import migrateAction from "./../actions/migrate.js"
import seedAction from "./../actions/seed.js"
import migrateDownAction from "./../actions/migrateDown.js"
import seedListAction from "./../actions/seedList.js"
import migrateDownAllAction from "./../actions/migrateDownAll.js"


/**
 * @type {nmf.Provider}
 */
export const dbProvider = {
    async bind(app) {
        const db = new DB(app);
        app.ctx
            .bind(BIND_DB_SOURCE, db)
            .bind(BIND_DB_MIGRATOR, new Migrator(app, db))
            .bind(BIND_DB_SEEDER, new Seeder(app, db))
    },
    async resolve(app) {
        /**
         * @type {nmf.DB}
         */
        const db = app.ctx.fetch(BIND_DB_SOURCE);
        await db.connect();

        const migrator = app.ctx.fetch(BIND_DB_MIGRATOR);
        await migrator.resolve();

        const seeder = app.ctx.fetch(BIND_DB_SEEDER);
        await seeder.resolve();

        const am = /** @type {nmf.ActionManager} */ app.ctx.fetch(BIND_ACTION_MANAGER);

        am.register(migrateAction)
            .register(migrateDownAction)
            .register(migrateDownAllAction)
            .register(seedAction)
            .register(seedListAction)
    }
}
