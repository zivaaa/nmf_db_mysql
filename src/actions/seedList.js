import {BIND_DB_SEEDER} from "../consts.js";

/**
 * @type {nmf.Action}
 */
const action = {
    name: "db.seed.list",
    description: "показать список сидов",
    async fn(app) {
        const seeder = /** @type {nmf.Seeder} */ app.ctx.fetch(BIND_DB_SEEDER);
        console.log("# SEED LIST");

        for (const [k,v] of seeder.getAllSeeds()) {
            console.log(`# ${v.name}`);
            if (v.description) {
                console.log(`|-> ${v.description}`);
            }
        }

        return true;
    }
}

export default action;