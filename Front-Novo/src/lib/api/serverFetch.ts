import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";

export default async function serverFetch(
  url: string,
  method?: string,
  body?: object,
  multipart: boolean = false,
  params?: { [key: string]: string }
) {
  const apiUrl = new URL(`${process.env.API_URL}${url}`);

  if (params) {
    Object.keys(params).forEach((key) => {
      if (Array.isArray(params[key])) {
        (params[key] as unknown as string[]).forEach((value) => {
          apiUrl.searchParams.append(key, value);
        });
      } else {
        apiUrl.searchParams.append(key, params[key] as string);
      }
    });
  }

  const res = await fetch(apiUrl.toString(), {
    method: method ?? "GET",
    headers: {
      Authorization: `Bearer ${
        (
          await getServerSession(authOptions)
        )?.accessToken
      }`,
      ...(multipart ? {} : { "Content-Type": "application/json" }),
    },
    body: multipart ? (body as BodyInit) : JSON.stringify(body),
  });

  return res;
}
