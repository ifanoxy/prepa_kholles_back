import {App} from "../../core/App";

export default function (app: App): string
{
    app.app.get("/v1/ping", async (req, res) => {
        res.status(200).json({ data: { ping: req.headers.date ? (Date.now() - new Date(req.headers.date).getTime()) : NaN } });
    });

    return "GET v1/ping";
}

interface UserAuthData {
    first_name: string;
    last_name: string;
}
