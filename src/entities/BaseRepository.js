/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @class BaseRepository
 */
export class BaseRepository {
    /**
     * @type {nmf.App}
     */
    app = undefined;

    constructor(app) {
        this.app = app;
    }

    /**
     * prepare repository
     * bind all u need
     * @return {void}
     */
    prepare() {

    }

    /**
     * some custom logic
     * @return {Promise<void>}
     */
    async resolve() {

    }
}