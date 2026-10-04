/** A person's display name: first and last, whichever of them exist. */
export const fullName = (person: {
  firstName?: string;
  lastName?: string | null;
}) => [person.firstName, person.lastName].filter(Boolean).join(" ");
