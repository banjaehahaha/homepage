# Claude 작업 가이드

## 주요 명령어

```bash
yarn dev      # 개발 서버
yarn build    # 빌드 (ESLint는 빌드 시 무시됨 — next.config.ts 설정)
yarn lint     # 린트
```

## 콘텐츠 수정 위치

- **작업/전시/연구 내용**: `public/data/*.json`
- **CV 항목**: `components/cvList.ts`
- **아카이브(보도자료 등)**: `components/archiveList.ts`
- **다이어그램 노드 좌표**: `public/data/Nodes.json`

## 코드 컨벤션

- 색상 포인트: lime `#92F90E` (Tailwind `lime-400`)
- 이중언어: 텍스트는 `{ en: string; ko: string }` 형태, 언어 상태는 각 컴포넌트가 자체 관리
- 이미지/영상/PDF는 `public/` 하위에 위치, `fetch()`로 JSON을 클라이언트 사이드에서 로드
- SSR에서 `localStorage` 접근 시 `instrumentation.ts`의 폴리필이 처리함 — 별도 `typeof window` 가드 불필요

## 하지 말 것

- `public/data/` JSON 구조(키 이름)를 임의로 바꾸면 컴포넌트 전체가 깨짐 — 구조 변경 시 관련 컴포넌트 일괄 수정 필요
- `Nodes.json`의 `px`/`py` 좌표는 캔버스 렌더링에 직접 쓰임 — 수정 시 다이어그램 레이아웃 확인 필수
- 빌드 속도를 위해 ESLint가 비활성화되어 있으므로 `yarn lint`를 별도로 실행해 확인할 것

## 문서 관리

- `CLAUDE.md`: Claude 작업 가이드 (이 파일)
- `README.md`: 프로젝트 개요
- `docs/ARCHITECTURE.md`: 설계 결정 및 데이터 흐름
