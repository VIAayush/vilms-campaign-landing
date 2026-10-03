import { startTransition, type FormEvent } from "react";

/**
 * React resets a <form action={...}> after every submission, which throws away
 * what someone typed when the server rejects it. Submitting through this
 * handler runs the same action but leaves the fields alone.
 */
export function submitKeepingValues(dispatch: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
}
