/**
 * Temporary ANAMI wordmark reproduced from the reference design.
 * Replace the contents of this component with the official logo (e.g. an <svg>) when supplied.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block font-sans font-light uppercase leading-none tracking-[0.32em] [margin-right:-0.32em] ${className}`}
    >
      Anami
    </span>
  );
}
