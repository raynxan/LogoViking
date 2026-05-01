import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Moon, Sun, Menu, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TOOLS } from "@/lib/tools";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 mx-auto">
        <Link href="/" className="mr-6 flex items-center gap-2.5">
          <img
            src="/images/logoviking-icon.png"
            alt=""
            className="h-10 w-10 object-contain"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}
          />
          <span className="font-extrabold text-xl leading-none tracking-tight select-none">
            Logo<span className="text-amber-500">Viking</span>
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground/80 text-foreground/60 transition-colors">
                Tools
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/tools")}>
                  All Tools
                </DropdownMenuItem>
                {TOOLS.slice(0, 5).map((tool) => (
                  <DropdownMenuItem key={tool.slug} onClick={() => setLocation(`/tools/${tool.slug}`)}>
                    {tool.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/pricing" className="hover:text-foreground/80 text-foreground/60 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-foreground/80 text-foreground/60 transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full p-0 overflow-hidden"
                    data-testid="button-user-menu"
                    aria-label="Open user menu"
                  >
                    <UserAvatar
                      name={user.name}
                      email={user.email}
                      avatarUrl={user.avatarUrl}
                      className="h-8 w-8"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLocation("/login")}>Sign In</Button>
                <Button onClick={() => setLocation("/signup")}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
