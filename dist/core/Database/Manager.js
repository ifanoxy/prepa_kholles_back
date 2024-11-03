"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Manager {
    constructor(database, tableName) {
        this.database = database;
        this.tableName = tableName;
    }
    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param {Record<string, any>} where les wheres de la requetes
     * @private
     */
    formatWhere(where) {
        return Object.entries(where).map(([key, value]) => {
            if (typeof value === "string") {
                return `\`${key}\`='${value.replace(/'/g, "''")}'`;
            }
            else if (typeof value === "number" || typeof value === "boolean") {
                return `\`${key}\`=${value}`;
            }
            else {
                return `\`${key}\` IS NULL`;
            }
        }).join(" AND ");
    }
    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param {Record<string, any>} values les valeurs de la requetes
     * @private
     */
    formatSet(values) {
        return Object.entries(values).map(([key, value]) => {
            if (typeof value === "string") {
                return `\`${key}\`='${value.replace(/'/g, "''")}'`;
            }
            else if (typeof value === "number" || typeof value === "boolean") {
                return `\`${key}\`=${value}`;
            }
            else {
                return `\`${key}\`= NULL`;
            }
        }).join(", ");
    }
    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param {Record<string, any>} values les valeurs entrée par l'utilisateur
     * @private
     */
    formatValues(values) {
        return Object.entries(values).map(([key, value]) => {
            if (typeof value === "string") {
                return `'${value.replace(/'/g, "''")}'`;
            }
            else if (typeof value === "number" || typeof value === "boolean") {
                return value;
            }
            else {
                return 'NULL';
            }
        }).join(", ");
    }
    /**
     * Obtenir une valeur de la base de donnée
     *
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     */
    async get(where, includes = ["*"]) {
        return (await this.database.query(`SELECT \`${includes.join("\`,\`")}\` FROM ${this.tableName} WHERE ${this.formatWhere(where)} LIMIT 1`))[0];
    }
    /**
     * Obtenir une liste de valeurs de la base de donnée
     *
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     * @param {getAllOptions} options les options de la requête
     */
    async getAll(where, includes = ["*"], options = { offset: 0, limits: 100 }) {
        return (await this.database.query(`SELECT \`${includes.join("\`,\`")}\` FROM ${this.tableName} ${where ? `WHERE ${this.formatWhere(where)}` : ""} LIMIT ${options.limits} OFFSET ${options.offset}`));
    }
    /**
     * Permet d'ajouter des valeurs ou une liste de valeurs en base de donnée
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    async insert(values) {
        return (await this.database.query(`INSERT INTO ${this.tableName} (\`${Array.isArray(values) ? Object.keys(values[0]).join("\`, \`") : Object.keys(values).join("\`, \`")}\`) VALUES (${Array.isArray(values) ? values.map(x => this.formatValues(Object.values(x))).join("), (") : this.formatValues(Object.values(values))})`));
    }
    /**
     * Permet d'ajouter des valeurs ou une liste de valeurs en base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    async update(where, values) {
        return (await this.database.query(`UPDATE ${this.tableName} SET ${this.formatSet(values)} WHERE ${this.formatWhere(where)}`));
    }
    /**
     * Permet de supprimer des lignes en base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     */
    async delete(where) {
        return (await this.database.query(`DELETE FROM ${this.tableName} WHERE ${this.formatWhere(where)}`));
    }
    /**
     * Vérifie si une ligne est existante dans la base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where
     */
    async has(where) {
        return (await this.database.query(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${this.formatWhere(where)}`))[0].count >= 1;
    }
    /**
     * Retourne une ligne si elle existe sinon renvoie null
     * @param {PrimaryKeys & Partial<Keys>} where
     */
    async getIfExists(where) {
        return await this.has(where) ? this.get(where) : null;
    }
    /**
     * Modifie ou Ajoute une ligne dans la base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    async UpdateOrCreate(where, values) {
        return await this.has(where) ? this.update(where, values) : this.insert({ ...values, ...where });
    }
}
exports.default = Manager;
