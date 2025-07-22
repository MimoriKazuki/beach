"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, User, Plus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"

const baseNavItems = [
  {
    href: "/",
    label: "ホーム",
    icon: Home,
  },
  {
    href: "/events",
    label: "探す",
    icon: Search,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const { isOrganizer } = useAuth()

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background">
        <div className="flex gap-2 border-t border-border bg-background px-4 pb-3 pt-2">
          {baseNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href === '/events' && pathname.startsWith('/events'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-end gap-1 rounded-full",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className="flex h-8 items-center justify-center">
                  <Icon 
                    className={cn(
                      "h-6 w-6",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <p className="text-xs font-medium leading-normal tracking-[0.015em]">
                  {item.label}
                </p>
              </Link>
            )
          })}
          
          {/* オーガナイザー用作成ボタン */}
          {isOrganizer && (
            <Link
              href="/events/create"
              className={cn(
                "flex flex-1 flex-col items-center justify-end gap-1 rounded-full",
                pathname === "/events/create"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex h-8 items-center justify-center">
                <Plus 
                  className={cn(
                    "h-6 w-6",
                    pathname === "/events/create" ? "text-foreground" : "text-muted-foreground"
                  )}
                  strokeWidth={pathname === "/events/create" ? 2.5 : 2}
                />
              </div>
              <p className="text-xs font-medium leading-normal tracking-[0.015em]">
                作成
              </p>
            </Link>
          )}
          
          {/* マイページ */}
          <Link
            href="/profile"
            className={cn(
              "flex flex-1 flex-col items-center justify-end gap-1 rounded-full",
              pathname === "/profile"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            <div className="flex h-8 items-center justify-center">
              <User 
                className={cn(
                  "h-6 w-6",
                  pathname === "/profile" ? "text-foreground" : "text-muted-foreground"
                )}
                strokeWidth={pathname === "/profile" ? 2.5 : 2}
              />
            </div>
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">
              マイページ
            </p>
          </Link>
          
          {/* 設定 */}
          <Link
            href="/settings"
            className={cn(
              "flex flex-1 flex-col items-center justify-end gap-1 rounded-full",
              pathname === "/settings"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            <div className="flex h-8 items-center justify-center">
              <Settings 
                className={cn(
                  "h-6 w-6",
                  pathname === "/settings" ? "text-foreground" : "text-muted-foreground"
                )}
                strokeWidth={pathname === "/settings" ? 2.5 : 2}
              />
            </div>
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">
              設定
            </p>
          </Link>
        </div>
        <div className="h-5 bg-background"></div>
      </nav>
    </>
  )
}