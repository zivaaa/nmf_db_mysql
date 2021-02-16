export const BIND_DB_SOURCE = "db.source";
export const BIND_DB_CONFIG = "db.config";
export const BIND_DB_MIGRATOR = "db.migrator";
export const BIND_DB_SEEDER = "db.seeder";
export const BIND_DB_REPO = "db.repo";
export const BIND_DB_LOADER = "db.loader";


/* fields */

export const MODEL_FIELD_LIST = "fieldsList";
export const MODEL_FIELD_LIST_PRIMARY = "primaryList";
export const MODEL_FIELD_LIST_PROTECTED = "protectedList";
export const MODEL_FIELD_LIST_NOT_PROTECTED = "notProtectedList";

/**
 * @type {nmf.DBModelList}
 */
export const defaultPrimaryList = {
    property: "primary",
    list: MODEL_FIELD_LIST_PRIMARY,
}
/**
 * @type {nmf.DBModelList}
 */
export const defaultProtectedList = {
    property: "protected",
    list: MODEL_FIELD_LIST_PROTECTED,
}
/**
 * @type {nmf.DBModelList}
 */
export const defaultNotProtectedList = {
    property: "*",
    list: MODEL_FIELD_LIST_NOT_PROTECTED,
    fn: (model) => model.fields.filter(v => !v.protected).map(v => v.name)
}

/**
 * @type {nmf.DBModelList}
 */
export const defaultAllFieldsList = {
    property: "*",
    list: MODEL_FIELD_LIST,
    fn: (model) => model.fields.map(v => v.name)
}