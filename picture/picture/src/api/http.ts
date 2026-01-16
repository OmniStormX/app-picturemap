// src/api/http.ts

import {BaseUrl} from "../config.ts";
import {HeadersInit} from "undici-types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ApiResponse<T> {
    status: string;
    msg: T;
}

async function request<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const token = await AsyncStorage.getItem('token') || '';
    const headers: HeadersInit = {
        ...(token ? { Authorization: token } : {}),
        ...options.headers,
    };

    const res = await fetch(BaseUrl + url, {
        ...options,
    // @ts-ignore
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }

    return res.json() as T;
}

export { request };
