import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, Card, Chip, Header, ListBox, ProgressBar, Table} from '@heroui/react';

/* 어비스 본 코드(derive.js·lab.js)가 만든 전역 함수·자료를 그대로 쓰고, 표시만 HeroUI로 한다 */

function useLab() {
  const [cat, setCat] = useState('');
  const [id, setId] = useState(() => {
    const q = location.hash.replace('#', '');
    return q && AB_METRICS.some(m => m.id === q) ? q : 'pop';
  });
  const [cont, setCont] = useState('');
  LAB.cat = cat; LAB.id = id; LAB.cont = cont;
  return {cat, setCat, id, setId, cont, setCont};
}

function Flag({iso}) {
  return <img className="flag" src={'../flags/' + iso + '.svg'} alt="" width={20} height={13} loading="lazy"
    onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />;
}

function TopBar({dark, setDark}) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 sm:px-8 bg-surface border-b border-border">
      <span className="text-lg font-semibold tracking-tight">Geogl3 Abyss</span>
      <Chip color="accent" variant="soft" size="sm"><Chip.Label>HeroUI 시안</Chip.Label></Chip>
      <span className="flex-1" />
      <Button size="sm" variant="ghost" onPress={() => { location.href = 'index.html'; }}>다른 시안 보기</Button>
      <Button size="sm" variant="secondary" onPress={() => setDark(!dark)}>{dark ? '라이트' : '다크'}</Button>
    </header>
  );
}

function Categories({cat, setCat}) {
  const cats = [['', '전체']].concat(labCats().map(c => [c, c]));
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {cats.map(([k, n]) => (
        <Button key={k || 'all'} size="sm" className="rounded-full" variant={cat === k ? 'primary' : 'outline'}
          onPress={() => setCat(k)}>{n}</Button>
      ))}
    </div>
  );
}

function Metrics({cat, id, setId}) {
  const groups = [];
  labMetrics().forEach(m => {
    let g = groups[groups.length - 1];
    if (!g || g.cat !== m.cat) { g = {cat: m.cat, items: []}; groups.push(g); }
    g.items.push(m);
  });
  return (
    <Card className="p-2 max-h-[80vh] overflow-auto">
      <ListBox aria-label="항목" selectionMode="single" disallowEmptySelection
        selectedKeys={new Set([id])} onSelectionChange={keys => { const k = [...keys][0]; if (k) setId(String(k)); }}>
        {groups.map(g => (
          <ListBox.Section key={g.cat}>
            <Header className="px-3 pt-3 pb-1 text-xs font-semibold text-muted">{g.cat}</Header>
            {g.items.map(m => (
              <ListBox.Item key={m.id} id={m.id} textValue={m.name}>
                <span className="flex-1">{m.name}</span>
                <span className="text-xs text-muted">{abRank(m.id).length}</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox.Section>
        ))}
      </ListBox>
    </Card>
  );
}

function Regions({cards, setCont}) {
  return (
    <div className="lab-regions">
      {cards.map(c => (
        <div key={c.k || 'all'} role="button" tabIndex={0} className="lab-reg"
          aria-disabled={c.off ? 'true' : undefined}
          onClick={() => { if (!c.off) setCont(c.k); }}
          onKeyDown={e => { if (!c.off && (e.key === 'Enter' || e.key === ' ')) setCont(c.k); }}>
          <Card className={'h-full ' + (c.on ? 'ring-2 ring-accent' : '')}>
            <Card.Header>
              <Card.Description className="flex items-center gap-2">
                {c.color ? <span className="inline-block size-2.5 rounded-full" style={{background: c.color}} /> : null}
                {c.name}
              </Card.Description>
              <Card.Title className="text-2xl tracking-tight">{c.val}</Card.Title>
            </Card.Header>
            <Card.Content><span className="text-xs text-muted">{c.sub}</span></Card.Content>
          </Card>
        </div>
      ))}
    </div>
  );
}

function RankTable({d}) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="순위표">
          <Table.Header>
            <Table.Column isRowHeader>순위</Table.Column>
            <Table.Column>나라</Table.Column>
            <Table.Column className="text-right">{d.m.unit || ''}</Table.Column>
            <Table.Column className="w-1/3 hidden sm:table-cell"> </Table.Column>
          </Table.Header>
          <Table.Body>
            {d.rows.map(r => (
              <Table.Row key={r.iso} id={r.iso}>
                <Table.Cell>{r.rank <= 3
                  ? <Chip color="accent" variant="soft" size="sm"><Chip.Label>{r.rank}</Chip.Label></Chip> : r.rank}</Table.Cell>
                <Table.Cell><a className="inline-flex items-center gap-2" href={'../index.html#/atlas?' + r.iso}><Flag iso={r.iso} />{r.name}</a></Table.Cell>
                <Table.Cell className="text-right whitespace-nowrap">{r.val}</Table.Cell>
                <Table.Cell className="hidden sm:table-cell">
                  <ProgressBar aria-label={r.name} value={r.pct} size="sm">
                    <ProgressBar.Track><ProgressBar.Fill style={{background: r.color}} /></ProgressBar.Track>
                  </ProgressBar>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const s = useLab();
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  const d = labData();
  return (
    <>
      <TopBar dark={dark} setDark={setDark} />
      <main className="lab-wrap">
        <h1>순위 도감</h1>
        <p className="lab-lead text-muted">항목마다 자료를 가진 나라를 끝까지 줄 세웁니다. 대륙 카드를 누르면 그 대륙만 남습니다.</p>
        <Categories cat={s.cat} setCat={s.setCat} />
        <div className="lab-grid">
          <aside className="lab-side"><Metrics cat={s.cat} id={s.id} setId={s.setId} /></aside>
          <section>
            <div className="lab-head"><h2>{d.m.name}</h2>
              <Chip size="sm" variant="secondary"><Chip.Label>{d.m.src} · {d.total}개국</Chip.Label></Chip></div>
            {d.m.note ? <p className="lab-note text-muted">{d.m.note}</p> : null}
            <Regions cards={d.cards} setCont={s.setCont} />
            <RankTable d={d} />
          </section>
        </div>
      </main>
    </>
  );
}
createRoot(document.getElementById('root')).render(<App />);
