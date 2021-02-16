/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @typedef {Object} nmf.Seed
 * @property {function(app:nmf.App,nmf.DB):Promise<void>} seed
 * @property {string} name
 * @property {string} description
 */


/**
 * @memberOf nmf
 * @typedef {Object} nmf.Migration
 * @property {function(app:nmf.App,nmf.DB):Promise<void>} up
 * @property {function(app:nmf.App,nmf.DB):Promise<void>} down
 */


/**
 * @memberOf nmf
 * @typedef {Object.<string,*>} nmf.DBMetaModelField
 * @property {string} name
 * @property {bool} [primary]
 * @property {bool} [protected]
 */

/**
 * @memberOf nmf
 * @typedef {object} nmf.DBMetaModel
 * @property {string} table
 * @property {nmf.DBMetaModelField[]} fields
 * @property {Object.<string, nmf.DBMetaModelField>} [fieldsByName]
 * @property {Object.<string, string[]>} [fieldLists]
 * @property {string} [repositoryKey]
 * @property {typeof Object} model
 * @property {typeof Object} repository
 * @property {boolean} incremental
 */

/**
 * @memberOf nmf
 * @typedef {Object} nmf.DBMeta
 * @property {nmf.DBMetaModel[]} models
 * @property {nmf.DBModelList[]} lists
 */

/**
 * @memberOf nmf
 * @typedef {Object} nmf.DBConfig
 * @property {string} migrationsPath - relative of root
 * @property {string} seedsPath - relative of root
 * @property {string} metaPath - relative of root
 * @property {string} dbHost
 * @property {string|number} dbPort
 * @property {string} dbUser
 * @property {string} dbPassword
 * @property {string} dbName
 */


/**
 * @memberOf nmf
 * @typedef {Object} nmf.DBModelList
 * @property {string} property
 * @property {string} list
 * @property {function(model:nmf.DBMetaModel,list:nmf.DBModelList):string[]} [fn]
 */
export default {}