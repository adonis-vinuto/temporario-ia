"use client";
import { getSession } from "next-auth/react";
import type { IApiResponse, IFormDataInput } from "@/types";

export default async function clientFetch<T = IApiResponse>(
  url: string,
  method: string = "GET",
  body?: object
): Promise<T | undefined> {
  try {
    const session = await getSession();
   
    if (!session?.accessToken) {
      throw new Error("Não autenticado");
    }
   
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorData || res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    throw error;
  }
}

export async function clientFetchMultipart<T = IApiResponse>(
  url: string,
  method: string = "POST",
  body?: BodyInit,
  onUploadProgress?: (progress: number) => void
): Promise<T | undefined> {
  try {
    const session = await getSession();
   
    if (!session?.accessToken) {
      throw new Error("Não autenticado");
    }
   
    if (onUploadProgress && body instanceof FormData) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
       
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onUploadProgress(progress);
          }
        });
       
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              resolve(xhr.responseText as T);
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });
       
        xhr.addEventListener("error", () => {
          reject(new Error("Erro na requisição"));
        });
       
        xhr.open(method, `${process.env.NEXT_PUBLIC_API_URL}${url}`);
        xhr.setRequestHeader("Authorization", `Bearer ${session.accessToken}`);
        xhr.send(body);
      });
    }
   
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: body,
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorData || res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    throw error;
  }
}

export function createFormData(data: IFormDataInput): FormData {
  const formData = new FormData();
 
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File || file instanceof Blob) {
          formData.append(key, file);
        }
      });
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
 
  return formData;
}