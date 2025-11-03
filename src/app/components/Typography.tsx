type TypographyProps = { theme: "light" | "dark"; children: React.ReactNode };

export const Typography = ({ theme, children }: TypographyProps) => {
  if (theme === "light") return <p className="text-black">{children}</p>;
  return <p className="text-white">{children}</p>;
};