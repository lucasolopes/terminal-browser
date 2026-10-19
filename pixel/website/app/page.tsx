import Carousel, { type Demo } from "./components/carousel";
import { GithubMark, StarIcon } from "./components/icons";
import Install from "./components/install";
import PixelBackground from "./components/pixel-background";
import { starCount } from "./components/stars";
import Wordmark from "./components/wordmark";

export const revalidate = 3600;

const REPO = "https://github.com/zenbu-labs/terminal-browser";
const DOCS = `${REPO}/tree/main/pixel#documentation`;
const EXAMPLES = `${REPO}/tree/main/pixel/examples`;

const FEATURES = [
  // fixme: placeholder copy
  "120 fps pixel perfect graphics in the terminal",
  // fixme: placeholder copy
  "Embeddable inside existing TUIs",
  // fixme: placeholder copy
  "Built in Chromium WebView component",
  // fixme: placeholder copy
  "Cross platform",
  // fixme: placeholder copy
  "Built on top of Rust with a TypeScript React API",
  // fixme: placeholder copy
  "Agent-friendly dev tools",
];

const DEMOS: Demo[] = [
  {
    label: "Browser",
    media: { kind: "video", src: "https://terminal-browser.com/demo.mp4", poster: "https://terminal-browser.com/demo-poster.png" },
    // fixme: placeholder copy
    caption: (
      <>
        <a href={REPO}>terminal-browser</a> · a real browser inside your terminal
      </>
    ),
  },
  {
    label: "Vscode",
    media: { kind: "video", src: "https://tode.sh/demo-dark.mp4" },
    // fixme: placeholder copy
    caption: (
      <>
        <a href="https://tode.sh">terminal-code</a> · vscode inside your terminal
      </>
    ),
  },
  {
    label: "Zed",
    // fixme: placeholder copy
    media: { kind: "image", src: "/media/zed.jpg", alt: "Zed running in a terminal pane" },
    // fixme: placeholder copy
    caption: "zed · the zed editor inside your terminal",
  },
];

const USED_BY = [
  // fixme: placeholder copy
  { name: "terminal-browser", repo: "zenbu-labs/terminal-browser", description: "a real browser inside your terminal" },
  // fixme: placeholder copy
  { name: "terminal-code", repo: "zenbu-labs/terminal-code", description: "vscode inside your terminal" },
];

export default async function Home() {
  const stars = Object.fromEntries(await Promise.all(USED_BY.map(async (p) => [p.repo, await starCount(p.repo)])));

  return (
    <>
      <PixelBackground />
      <div className="col">
        <header className="site">
          <span />
          <span className="right">
            <a href={DOCS}>docs</a>
            <a href={EXAMPLES}>examples</a>
            <a className="gh-stars" href={REPO} title="zenbu-labs/terminal-browser">
              <GithubMark />
              <b>
                <StarIcon />
                <span>{stars["zenbu-labs/terminal-browser"]}</span>
              </b>
            </a>
          </span>
        </header>

        <div className="hero">
          <Wordmark />
          {/* fixme: placeholder copy */}
          <p className="lede">Build graphical applications in the terminal</p>
          <Install />
        </div>

        <section data-component>
          {/* fixme: placeholder copy */}
          <h2>Features</h2>
          <ul className="facts">
            {FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section data-component>
          {/* fixme: placeholder copy */}
          <h2>Demos</h2>
          <Carousel demos={DEMOS} />
        </section>

        <section data-component>
          {/* fixme: placeholder copy */}
          <h2>Used by</h2>
          <div className="rows">
            {USED_BY.map((project) => (
              <a key={project.repo} href={`https://github.com/${project.repo}`}>
                <span className="n">{project.name}</span>
                <span className="d">{project.description}</span>
                <span className="m">
                  <StarIcon />
                  <span>{stars[project.repo]}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <footer>
          <span>MIT · zenbu labs</span>
          <span className="links">
            <a href={DOCS}>docs</a>
            <a href={EXAMPLES}>examples</a>
            <a href="https://www.npmjs.com/package/@zenbu-labs/pixel">npm</a>
            <a href="https://discord.gg/t3jzHHfc6z">discord</a>
            <a href={`${REPO}/tree/main/pixel`}>github</a>
          </span>
        </footer>
      </div>
    </>
  );
}
