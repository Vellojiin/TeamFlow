"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "../modules/auth/infrastructure/auth-context"

export function useRequiredAuth(){

    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/");
        }
    }, [isLoading, user, router])

    return {
        user,
        isLoading
    }
}