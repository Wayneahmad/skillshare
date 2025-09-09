// src/components/Button.jsx
export default function Button({
  as: Comp = "a",
  variant = "solid",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles = {
    solid: "bg-slate-900 text-white hover:opacity-90",
    outline: "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
  };
  return (
    <Comp className={`${base} ${styles[variant]} ${className}`} {...props} />
  );
}
