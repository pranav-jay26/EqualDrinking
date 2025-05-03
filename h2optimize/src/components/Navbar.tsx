"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  return (
    <nav className="w-full py-4 px-6 border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center text-2xl font-bold text-primary">
          <Droplets className="h-8 w-8 text-primary" />
          <span className="ml-2">H2Optimize</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/results">Results</Link>
          </Button>
          
          {isSignedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              
              <Button variant="ghost" asChild>
                <Link href="/preferences">Preferences</Link>
              </Button>
              
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10"
                  }
                }}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <Button variant="default">Sign Up</Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
