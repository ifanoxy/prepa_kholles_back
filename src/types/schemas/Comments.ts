export interface CommentsPrimaryKeys
{
    /**
     * Auto Increment
     * @optional
     */
    id: number;
}

export interface CommentsKeys
{
    author_id: number;
    sujet_id: number;
    content: string;
    created_time?: string;
}