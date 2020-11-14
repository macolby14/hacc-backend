type User = {
    email: string;
    password: string;
    score: number;
    auth: string;
}

export function getUser(email: string) {
  `CREATE TABLE IF NOT EXISTS public.user_accounts(
        email TEXT primary key,
        password TEXT,
        auth TEXT,
        score INTEGER
        );`;
}
