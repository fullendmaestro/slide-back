"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import Form from "next/form";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { updateProfile, type ProfileUpdateActionState } from "../actions";
import { ProfileImageUploader } from "@/components/profile/profile-image-uploader";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<
    ProfileUpdateActionState,
    FormData
  >(
    (state: ProfileUpdateActionState, formData: FormData) =>
      updateProfile(state, formData, session?.user?.id || ""),
    {
      status: "idle",
    }
  );

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);

  useEffect(() => {
    if (state.status === "failed") {
      toast.error("Failed to update profile!");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success") {
      toast.success("Profile updated successfully!");
      setIsSuccessful(true);
      console.log(state);
      updateSession();
    }
  }, [state, updateSession]);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-muted">
              {session.user.image ? (
                <Image
                  src={session.user.image || "/placeholder.svg"}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {session.user.name?.charAt(0) ||
                      session.user.email?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <ProfileImageUploader />
          </div>

          <Form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={session.user.name || ""}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={session.user.email || ""}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <SubmitButton isSuccessful={isSuccessful}>
              Update Profile
            </SubmitButton>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
