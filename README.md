# lab_test — 임상검사 단위 변환 · 참고구간

React + TypeScript + Vite 정적 사이트 (GitHub Pages).

**Pages URL: https://fsysy.github.io/lab_test/**

> 교육·참고용입니다. 임상 판단은 해당 검사실의 보고 단위와 참고구간을 따르세요.

## 기능

1. **변환** — 분석물 검색(영문·한글·동의어) → 값·원본/대상 단위 → 결과 + "계산 근거"(방법·계수·수식·가정·출처). 양방향 스왑, 복사, 근거 없는 변환(예: mg/dL→U/L)은 이유와 함께 거부.
2. **참고구간** — 분석물 + 나이 + 성별 + 검체 → 공표된 구간만 표시(없는 나이 구간은 외삽하지 않음). 결과값을 넣으면 low/normal/high 판정.

## 데이터 출처

| 역할 | 출처 | 상태 |
|---|---|---|
| 단위 변환 엔진 | UCUM `@lhncbc/ucum-lhc` + IUPAC 원자량(분자량은 화학식에서 계산) + 이온 전하 | 사용 |
| HbA1c NGSP↔IFCC | ngsp.org/ifcc.asp 마스터 방정식 | 사이트 접속 불가 → `TODO(verify)` |
| uACR·uPCR mg/g↔mg/mmol | KDIGO 2024 (크레아티닌 분자량으로 계산) | 사이트 접속 불가 → `TODO(verify)` |
| BUN↔요소, 중성지방 | 분자량 계산(요소 N₂/CH₄N₂O, 트리올레인 가정) | 사용 |
| 참고구간 | AACB/RCPA Harmonised RI 첫 패널(Tate et al. 2014, PMC4310061) | RCPA Table 6 페이지는 403 → 논문 표로 대체, `TODO(verify)` |
| 소아 | CALIPER 링크 안내만 (수치 미포함) | — |
| 교차검증(테스트 전용) | Labcorp SI Unit Conversion Table | 테스트에 사용 |
| 교차검증(테스트 전용) | CMEinfo PDF, NBME PDF | **확보 못함** (`test.todo`) |

## 확보하지 못한 자료와 이유

- **RCPA Table 6 원문**: rcpa.edu.au가 Cloudflare 봇 차단(HTTP 403)으로 이 환경에서 열리지 않음. 같은 조화 구간을 실은 공개 논문(PMC4310061) 표 1·2의 12개 분석물만 수록. Table 6에 있는 그 외 분석물(ALT, AST, GGT, 요소, 요산, 알부민, 빌리루빈, 포도당, 지질 등)은 **구간 없음**으로 두었음.
- **ngsp.org / kdigo.org**: 접속 불가(연결 실패 / 406). 공식·공표된 수식을 사용하되 해당 페이지에서 직접 확인하지 못함.
- **CMEinfo 변환표 PDF, NBME Laboratory Reference Values PDF**: 공식 PDF 위치를 찾지 못했거나(404) 미러만 존재 → 교차검증 미실시.
- **IUPAC 원자량**: CIAAW 약식 표준 원자량(관용값)을 입력함. ciaaw.org에서 재확인하지 못함 (`TODO(verify)`).

## 개발

```bash
npm ci
npm test        # Vitest
npm run build   # tsc + vite build → dist/
npm run dev
```

`main`에 푸시하면 `.github/workflows/deploy.yml`이 테스트·빌드 후 Pages에 배포합니다
(저장소 Settings → Pages → Source = **GitHub Actions** 필요).
