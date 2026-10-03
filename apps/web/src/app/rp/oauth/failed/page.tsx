"use client";

import { CgClose } from "react-icons/cg";
import { useSearchParams } from "@/lib/navigation";
import * as S from "../callback/styled";

/**
 * Why a social login did not complete.
 *
 * It used to say "There was an error during the OAuth process" for everything,
 * which is unhelpful for the two cases that are now the most likely: a provider
 * that returned no email address, and a provider that returned one it has not
 * verified. Neither is something the user can fix by trying again, and both need
 * a different next step — so the handler passes a reason and this page explains
 * it.
 *
 * The unverified-email case is a security boundary, not a bug. Discord attaches
 * an address to an account before confirming it, so accepting an unverified
 * assertion would let anyone with a fresh Discord account claim the Novelist
 * World account belonging to that address.
 */

const EXPLANATIONS: Record<string, { heading: string; body: string }> = {
  no_email: {
    body: "Novelist World identifies your account by email address, and the provider you signed in with did not share one. Add an email address to that account, or sign in with your email and password instead.",
    heading: "No email address",
  },
  unverified_email: {
    body: "The provider you signed in with has not confirmed that the email address on that account belongs to you. Confirm it there and try again — we cannot sign you in on an unconfirmed address, because that would let anyone claiming the address into your account.",
    heading: "Email not confirmed",
  },
  username_unavailable: {
    body: "We could not find a free username for your new account. Please try again, or sign up with an email address and choose one yourself.",
    heading: "Could not pick a username",
  },
};

const FALLBACK = {
  body: "There was an error while signing you in. Please try again.",
  heading: "Sign-in failed",
};

export default function FailedOAuthPage() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason") ?? "";
  const { heading, body } = EXPLANATIONS[reason] ?? FALLBACK;

  return (
    <S.PageRoot>
      <S.ContentCard>
        <S.Heading>
          <CgClose className="error" />
          <h1>{heading}</h1>
        </S.Heading>
        <S.Description>{body}</S.Description>
      </S.ContentCard>
    </S.PageRoot>
  );
}
