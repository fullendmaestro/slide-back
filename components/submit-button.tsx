"use client";

import { useFormStatus } from "react-dom";

import { LoaderIcon } from "lucide-react";

import { Button } from "./ui/button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? "button" : "submit"}
      aria-disabled={pending}
      disabled={pending}
      className="relative"
    >
      {children}

      {pending && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending ? "Loading" : "Submit form"}
      </output>
    </Button>
  );
}
