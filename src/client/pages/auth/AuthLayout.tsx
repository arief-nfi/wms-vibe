import React from 'react'
import { Outlet } from 'react-router'
import { GalleryVerticalEnd } from "lucide-react"

const AuthLayout = () => {
  return (
    <div className="bg-muted flex min-h-svh w-full items-center justify-center">
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Web Admin
        </a>
        <Outlet />
      </div>
    </div>
    </div>
  )
}

export default AuthLayout