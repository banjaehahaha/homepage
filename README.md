# Jaeha Ban — Portfolio

반재하의 포트폴리오 웹사이트. 퍼포먼스, 설치, 연구 작업을 소개하는 인터랙티브 아카이브.

## 기술 스택

- Next.js 15 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4
- Framer Motion
- Vercel Analytics

## 시작하기

```bash
yarn dev      # 개발 서버 (localhost:3000)
yarn build    # 프로덕션 빌드
yarn lint     # ESLint
```

## 주요 기능

- **홈 캔버스** — 북한 접경 지역 지도 위 인터랙티브 핀 (영상 팝업)
- **다이어그램 뷰** (`/diagram`) — 프로젝트·연구·전시를 노드로 연결한 네트워크 시각화
- **CV / 아카이브** — 전시 이력, 보도자료, 인터뷰
- **이중언어** — 전체 콘텐츠 한국어/영어 전환 지원

## 콘텐츠 수정

모든 콘텐츠는 `public/data/`의 JSON 파일로 관리됩니다.

| 파일 | 내용 |
|---|---|
| `projects.json` | 작업 상세 (제목, 설명, 미디어) |
| `Nodes.json` | 다이어그램 노드 위치·연결 정보 |
| `exhibitions.json` | 전시 정보 |
| `research.json` | 연구 프로젝트 |

CV와 아카이브 목록은 `components/cvList.ts`, `components/archiveList.ts`에서 수정합니다.
