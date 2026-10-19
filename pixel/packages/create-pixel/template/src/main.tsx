import { Box, Link, Text, createRoot, makeTheme, useTerminalColors } from "@zenbu-labs/pixel";
import type { Theme } from "@zenbu-labs/pixel";

const root = createRoot({
  onKey(event) {
    if (event.kind === "press" && event.mods.ctrl && event.key === "c") {
      root.stop();
      return true;
    }
  },
});

const PIXEL = "https://github.com/zenbu-labs/terminal-browser/tree/main/pixel";

const LINKS = [
  { title: "Docs", url: `${PIXEL}#documentation` },
  { title: "Examples", url: `${PIXEL}/examples` },
];

const GLYPHS: Record<string, string[]> = {
  p: ["....", "....", "####", "#..#", "#..#", "#..#", "####", "#...", "#..."],
  i: ["#", ".", "#", "#", "#", "#", "#", ".", "."],
  x: [".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", ".....", "....."],
  e: ["....", "....", "####", "#..#", "####", "#...", "####", "....", "...."],
  l: ["#.", "#.", "#.", "#.", "#.", "#.", "##", "..", ".."],
};
const ROWS = 9;

function wordmarkCells() {
  const cols: boolean[][] = [];
  for (const letter of "pixel") {
    const glyph = GLYPHS[letter];
    for (let x = 0; x < glyph[0].length; x++) cols.push(glyph.map((row) => row[x] === "#"));
    cols.push(new Array(ROWS).fill(false));
  }
  cols.pop();
  return cols;
}

const CELLS = wordmarkCells();

function Wordmark({ cell, color }: { cell: number; color: Theme["fg"] }) {
  const gap = Math.max(1, Math.round(cell / 15));
  return (
    <Box style={{ width: CELLS.length * cell, height: ROWS * cell, flexShrink: 0 }}>
      {CELLS.flatMap((col, x) =>
        col.map((on, y) =>
          on ? (
            <Box
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                inset: { left: x * cell, top: y * cell },
                width: cell - gap,
                height: cell - gap,
                background: color,
              }}
            />
          ) : null,
        ),
      )}
    </Box>
  );
}

function App() {
  const theme = makeTheme(useTerminalColors());
  const rem = root.info.basePx;

  return (
    <Box
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: rem * 2.5,
        width: "100%",
        height: "100%",
        padding: rem * 2,
        background: theme.bg,
      }}
    >
      <Wordmark cell={Math.round(rem * 0.7)} color={theme.fg} />

      <Box style={{ alignItems: "center", gap: rem * 0.5 }}>
        <Text style={{ fontSize: rem * 0.9, color: theme.muted, selectable: false }}>Get started by editing</Text>
        <Box
          style={{
            padding: { left: rem * 0.5, right: rem * 0.5, top: rem * 0.2, bottom: rem * 0.2 },
            background: theme.field,
            border: { width: 1, color: theme.hairline },
          }}
        >
          <Text style={{ fontSize: rem * 0.85, color: theme.fg }}>src/main.tsx</Text>
        </Box>
      </Box>

      <Box style={{ gap: rem * 2 }}>
        {LINKS.map((link) => (
          <Link key={link.title} href={link.url} style={{ fontSize: rem * 0.9, color: theme.muted, hoverColor: theme.fg }}>
            {`${link.title} →`}
          </Link>
        ))}
      </Box>

      <Text style={{ fontSize: rem * 0.75, color: theme.disabled, selectable: false }}>ctrl+c to quit</Text>
    </Box>
  );
}

root.render(<App />);
