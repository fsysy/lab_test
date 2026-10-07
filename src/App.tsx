import { useState } from 'react';
import { ConvertTab } from './components/ConvertTab';
import { RangeTab } from './components/RangeTab';

export default function App() {
  const [tab, setTab] = useState<'convert' | 'range'>('convert');
  return (
    <>
      <header className="masthead">
        <h1>검사 단위 변환과 참고구간</h1>
        <p>교육·참고용입니다. 임상 판단은 해당 검사실의 보고 단위와 참고구간을 따르세요.</p>
        <div role="tablist" className="tabs">
          <button role="tab" aria-selected={tab === 'convert'} onClick={() => setTab('convert')}>변환</button>
          <button role="tab" aria-selected={tab === 'range'} onClick={() => setTab('range')}>참고구간</button>
        </div>
      </header>
      <main>{tab === 'convert' ? <ConvertTab /> : <RangeTab />}</main>
      <footer>
        <details>
          <summary>데이터 범위와 한계</summary>
          <p>
            RCPA Table 6 웹페이지, NGSP, KDIGO 사이트는 개발 환경에서 접속이 막혀 직접 확인하지 못했습니다.
            참고구간은 같은 AACB/RCPA 조화 구간을 실은 공개 논문 표의 첫 번째 패널 12개 분석물만 담았습니다.
            ALT, AST, GGT, 요소, 요산, 알부민, 빌리루빈, 포도당 등은 구간이 없습니다.
          </p>
        </details>
      </footer>
    </>
  );
}
