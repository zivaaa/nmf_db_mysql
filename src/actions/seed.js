import {BIND_DB_SEEDER} from "../consts.js";

/**
 * @type {nmf.Action}
 */
const action = {
    name: "db.seed",
    description: "запустить сид | требуется аргумент --seed=xxx",
    async fn(app, seedName = undefined) {
        const seeder = /** @type {nmf.Seeder} */ app.ctx.fetch(BIND_DB_SEEDER);
        if (!seedName) {
            seedName = app.tools.getArg("seed", null);
        }

        if (!seedName) {
            throw new Error("--seed={name} argument is missing");
        }

        await seeder.seed(seedName);
        await app.stop();
        return true;
    }
}

export default action;