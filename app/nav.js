/** Sub-tabs for the MSTR On-Chain section. */
export function MstrTabs({ on }) {
  return <div className="subtabs">{[['dash', 'Dashboard', '/mstr/'], ['tokens', 'Token directory', '/tokens/']].map(([k, l, h]) => <a key={k} href={h} className={k === on ? 'on' : ''}>{l}</a>)}</div>;
}
