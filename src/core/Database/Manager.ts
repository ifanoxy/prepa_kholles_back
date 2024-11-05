import Database from "./Database";
import {IncludesType} from "../../types/database/Includes";
import {ResultSetHeader} from "mysql2";
import {PartialKeys} from "../../types/utils/PartialKeys";
import {NullableKeys} from "../../types/utils/NullableKeys";

export default class Manager<PrimaryKeys extends Record<string, any>, Keys extends Record<string, any>> {
    constructor(private database: Database, public readonly tableName: string)
    {

    }

    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param {Record<string, any>} where les wheres de la requetes
     * @private
     */
    private formatWhere(where: Record<string, any>): string
    {
        return Object.entries(where).map(([key, value]) => {
            if (typeof value === "string") {
                return `\`${key}\`='${value.replace(/'/g, "''")}'`;
            } else if (typeof value === "number" || typeof value === "boolean") {
                return `\`${key}\`=${value}`;
            } else {
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
    private formatSet(values: Record<string, any>): string
    {
        return Object.entries(values).map(([key, value]) => {
            if (typeof value === "string") {
                return `\`${key}\`='${value.replace(/'/g, "''")}'`;
            } else if (typeof value === "number" || typeof value === "boolean") {
                return `\`${key}\`=${value}`;
            } else {
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
    private formatValues(values: Record<string, any>): string
    {
        return Object.entries(values).map(([key, value]) => {
            if (typeof value === "string") {
                return `'${value.replace(/'/g, "''")}'`;
            } else if (typeof value === "number" || typeof value === "boolean") {
                return value;
            } else {
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
    public async get(where: PartialKeys<PrimaryKeys, "id"> & Partial<Keys>, includes: IncludesType<Keys & PrimaryKeys> | "*" = "*"): Promise<PrimaryKeys & Keys>
    {
        return (await this.database.query(`SELECT ${includes === "*" ? "*" :("`" + includes.join("\`,\`") + "`")} FROM ${this.tableName} WHERE ${this.formatWhere(where)} LIMIT 1`))[0] as PrimaryKeys & Keys;
    }

    /**
     * Obtenir une liste de valeurs de la base de donnée
     *
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     * @param {getAllOptions} options les options de la requête
     */
    public async getAll(where?: PartialKeys<PrimaryKeys, "id"> & Partial<Keys>, includes: IncludesType<Keys & PrimaryKeys> | "*" = "*", options: getAllOptions = { offset: 0, limits: 100}): Promise<PrimaryKeys & Keys>
    {
        return (await this.database.query(`SELECT ${includes === "*" ? "*" :("`" + includes.join("\`,\`") + "`")} FROM ${this.tableName} ${where ? `WHERE ${this.formatWhere(where)}` : ""} LIMIT ${options.limits} OFFSET ${options.offset}`)) as unknown as PrimaryKeys & Keys;
    }

    /**
     * Permet d'ajouter des valeurs ou une liste de valeurs en base de donnée
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    public async insert(values: NullableKeys<PrimaryKeys, "id"> & Keys | (NullableKeys<PrimaryKeys, "id"> & Keys)[]): Promise<ResultSetHeader>
    {
        return (await this.database.query<ResultSetHeader>(`INSERT INTO ${this.tableName} (\`${Array.isArray(values) ? Object.keys(values[0]).join("\`, \`") : Object.keys(values).join("\`, \`")}\`) VALUES (${Array.isArray(values) ? values.map(x => this.formatValues(Object.values(x))).join("), (") : this.formatValues(Object.values(values))})`));
    }

    /**
     * Permet d'ajouter des valeurs ou une liste de valeurs en base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    public async update(where: PartialKeys<PrimaryKeys, "id"> & Partial<Keys>, values: Partial<PrimaryKeys | Keys>): Promise<ResultSetHeader>
    {
        return (await this.database.query<ResultSetHeader>(`UPDATE ${this.tableName} SET ${this.formatSet(values)} WHERE ${this.formatWhere(where)}`));
    }

    /**
     * Permet de supprimer des lignes en base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     */
    public async delete(where: PartialKeys<PrimaryKeys, "id"> & Partial<Keys>): Promise<ResultSetHeader>
    {
        return (await this.database.query<ResultSetHeader>(`DELETE FROM ${this.tableName} WHERE ${this.formatWhere(where)}`));
    }

    /**
     * Vérifie si une ligne est existante dans la base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where
     */
    public async has(where: PartialKeys<PrimaryKeys, "id"> & Partial<Keys>)
    {
        return ((await this.database.query(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${this.formatWhere(where)}`))[0] as unknown as { count: number }).count >= 1;
    }

    /**
     * Retourne une ligne si elle existe sinon renvoie null
     * @param {PrimaryKeys & Partial<Keys>} where
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     */
    public async getIfExists(where: PartialKeys<PrimaryKeys, "id"> & Partial<Keys>, includes: IncludesType<Keys & PrimaryKeys> | "*" = "*"): Promise<PrimaryKeys & Keys | null>
    {
        return await this.has(where) ? this.get(where, includes) : null;
    }

    /**
     * Modifie ou Ajoute une ligne dans la base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    public async UpdateOrCreate(where: PrimaryKeys & Partial<Keys>, values: Keys): Promise<ResultSetHeader>
    {
        return await this.has(where) ? this.update(where, values) : this.insert({ ...values, ...where });
    }
}

interface getAllOptions {
    /**
     * L'indice du première élément que à partir duquel on souhaite récupérer les données
     * Defaut: 0
     */
    offset: number;
    /**
     * Le nombre maximal d'élement que l'on souhaite récupérer
     * Default: 100
     */
    limits: number;
}
