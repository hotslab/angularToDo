export type User = {
    id: number
    email: string
    name: string
    surname: string
    role: string
    remember_me_token: string | null
    created_at: Date | string
    updated_at: Date | string
}

export type Token = {
    type: string
    token: string
    expires_at: Date | string
}