"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./app-context";
import { Button, Card, Field, SelectField, Tabs } from "./ui";

export function AccountForm() {
  const [mode, setMode] = useState("Sign in");
  const { act, busy, clear } = useApp();
  const router = useRouter();
  const signup = mode === "Create account";
  return (
    <Card>
      <Tabs
        values={["Sign in", "Create account"]}
        active={mode}
        change={(value) => {
          setMode(value);
          clear();
        }}
      />
      <form
        key={mode}
        className="stack"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = Object.fromEntries(new FormData(form).entries());
          const result = await act(signup ? "signup" : "signin", data);
          if (result.ok) {
            form.reset();
            router.replace(
              signup
                ? "/onboarding"
                : result.state?.view === "creator"
                  ? "/studio"
                  : "/feed",
            );
            router.refresh();
          }
        }}
      >
        {signup && (
          <Field
            label="Your name"
            name="name"
            autoComplete="name"
            required
            maxLength={80}
          />
        )}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={15}
          maxLength={128}
          required
          helper="Use 15–128 characters. A memorable passphrase works well."
        />
        {signup && (
          <SelectField label="I’m here as" name="role">
            <option value="audience">Audience</option>
            <option value="creator">Creator</option>
            <option value="both">Both</option>
          </SelectField>
        )}
        <Button type="submit" busy={busy} icon="arrow-right">
          {signup ? "Create AStra account" : "Sign in to AStra"}
        </Button>
        <p className="as-caption">
          Spotify and YouTube are optional connections in Settings after
          sign-in. Email verification and password-reset emails are not
          available in this local version.
        </p>
      </form>
    </Card>
  );
}
