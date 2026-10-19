"use client";

import { useState } from "react";
import { CopyIcon } from "./icons";

const MANAGERS = [
  { name: "npm", command: "npm install @zenbu-labs/pixel" },
  { name: "pnpm", command: "pnpm add @zenbu-labs/pixel" },
  { name: "bun", command: "bun add @zenbu-labs/pixel" },
];

export default function Install() {
  const [manager, setManager] = useState(0);
  const [copied, setCopied] = useState(false);
  const command = MANAGERS[manager].command;

  function copy() {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="install" data-component>
      <div className="managers">
        {MANAGERS.map((m, i) => (
          <button key={m.name} className={i === manager ? "on" : undefined} onClick={() => setManager(i)}>
            {m.name}
          </button>
        ))}
      </div>
      <div className="box">
        <code>{command}</code>
        <button className={copied ? "copy done" : "copy"} onClick={copy} aria-label="copy">
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}
