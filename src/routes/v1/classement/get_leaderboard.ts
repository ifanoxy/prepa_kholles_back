import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.get("/v1/leaderboard", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const rankingQuerySujet = `
            SELECT
                u.id AS userId,
                CONCAT(u.first_name, ' ', u.last_name) AS userName,
                COUNT(s.id) AS subjectCount
            FROM
                users u
            LEFT JOIN
                sujets s ON u.id = s.author_id
            GROUP BY
                u.id
            ORDER BY
                subjectCount DESC;
        `;

        const rankingSujet = await app.server.database.query(rankingQuerySujet);

        const rankingQueryComment = `
            SELECT
                u.id AS userId,
                CONCAT(u.first_name, ' ', u.last_name) AS userName,
                COUNT(c.id) AS commentCount
            FROM
                users u
            LEFT JOIN
                commentaires c ON u.id = c.author_id
            GROUP BY
                u.id
            ORDER BY
                commentCount DESC;
        `;

        const rankingComment = await app.server.database.query(rankingQueryComment);

        res.status(200).json({ data: { sujets: rankingSujet, comments: rankingComment} });
    });

    return "GET v1/leaderboard";
}

interface UserAuthData {
    first_name: string;
    last_name: string;
}
