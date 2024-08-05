export const multilineStringToTsx = (str: string) =>
  str.split(`\n`).map((line, idx) => <div key={`${line}-${idx}`}>{line}</div>);
