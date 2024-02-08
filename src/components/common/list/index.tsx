import { Children, ComponentPropsWithoutRef, FC } from "react";

export interface ListProps extends ComponentPropsWithoutRef<"ul"> {}

export const List: FC<ListProps> = ({ children }) => {
  return (
    <ul>
      {Children.toArray(children).map((child, idx) => (
        <li key={idx}>{child}</li>
      ))}
    </ul>
  );
};
