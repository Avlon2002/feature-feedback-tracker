"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  confirmMessage?: string; // if set, asks "Are you sure?" before submitting
};

// Submit button that disables itself while saving, so a double-click can't create duplicates
export default function SubmitButton({ children, className = "btn", pendingText = "Saving…", confirmMessage }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
