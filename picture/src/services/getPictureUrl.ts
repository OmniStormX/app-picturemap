import {BaseUrl} from "../config.ts";

export function getPlaceholderUrl(name: string) {
    return `${BaseUrl}/uploads/img/${name}_9x16.webp`
}

export function getPreviewUrl(name: string) {
    return `${BaseUrl}/uploads/img/${name}_90x160.webp`
}


export function getImageUrl(name: string) {
    return `${BaseUrl}/uploads/img/${name}.webp`
}