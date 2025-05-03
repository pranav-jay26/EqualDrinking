"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">Equal Drinking</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to save and manage your efficient appliance recommendations
          </p>
        </div>
        
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "bg-white dark:bg-gray-800 shadow-md rounded-lg",
              headerTitle: "text-2xl font-bold text-foreground",
              headerSubtitle: "text-gray-600 dark:text-gray-400",
            },
          }}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}
