import { UserPermissions } from "../UserPermissions";

interface UsersPrimaryKeys
{
    /**
     * Auto Increment
     * @optional
     */
    id?: number;
}

interface UsersKeys
{
    /**
     * Longueur maximal 32
     */
    username: string;
    /**
     * Longueur maximal 128
     */
    password: string;
    permissions: UserPermissions;
}

type UsersSchema = UsersPrimaryKeys & UsersKeys;

export { UsersSchema, UsersKeys, UsersPrimaryKeys };