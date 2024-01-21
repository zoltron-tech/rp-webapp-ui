export const setOpacity = (hex: string, alpha: number) =>
  `${hex.slice(0, 7)}${Math.floor(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;

export const is = <T>(unionProp: T, prop: T): boolean => unionProp === prop;
