import Link from "next/link";
import type { ReactNode } from "react";

// Keep supplied wording intact while making contact details and policy references actionable.
function inlineLinks(text: string): ReactNode[] {
  const tokens = text.split(/(https:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[a-zA-Z]+|\+91[\d ]{10,14}|Cancellation & Refund Policy|Privacy Policy|Terms & Conditions)/g);
  const policies: Record<string, string> = { "Privacy Policy": "/privacy-policy", "Terms & Conditions": "/terms-and-conditions", "Cancellation & Refund Policy": "/cancellation-and-refund-policy" };
  const className = "rounded-sm text-primary-700 underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary motion-reduce:transition-none";
  return tokens.map((token, index) => {
    if (policies[token]) return <Link key={index} href={policies[token]} className={className}>{token}</Link>;
    if (/^https:\/\//.test(token)) return <a key={index} href={token} className={`${className} break-all`}>{token}</a>;
    if (/^[\w.+-]+@/.test(token)) return <a key={index} href={`mailto:${token}`} className={`${className} break-all`}>{token}</a>;
    if (/^\+91/.test(token)) return <a key={index} href={`tel:${token.replace(/[^\d+]/g, "")}`} className={className}>{token}</a>;
    return token;
  });
}

export default function DocumentBlocks({ blocks }: { blocks: readonly string[] }) {
  return <div className="space-y-4 break-words text-sm leading-7 text-body sm:text-base sm:leading-8">
    {blocks.map((block, index) => {
      if (/^\d+\.\d+\s/.test(block)) return <h3 key={index} className="pt-3 font-body text-base font-semibold leading-7 text-secondary">{block}</h3>;
      const lines = block.split("\n");
      const isList = lines.length >= 3 && lines.every((line) => !/^[^:]+:|^\+91/.test(line));
      if (isList) return <ul key={index} className="list-disc space-y-1.5 pl-5 marker:text-primary">{lines.map((line, itemIndex) => <li key={itemIndex}>{inlineLinks(line)}</li>)}</ul>;
      return <p key={index} className="whitespace-pre-line">{inlineLinks(block)}</p>;
    })}
  </div>;
}
