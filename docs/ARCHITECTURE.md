# 아키텍처

## 데이터 흐름

```
public/data/*.json
    ↓ (클라이언트 fetch)
컴포넌트 useState
    ↓
렌더링 (모달 / 다이어그램 / 패널)
```

정적 JSON 파일을 서버 사이드가 아닌 클라이언트에서 `fetch()`로 불러옵니다. 빌드 없이 JSON만 수정해도 콘텐츠가 반영되는 대신, 초기 로딩 시 네트워크 요청이 발생합니다.

## 모달 기반 네비게이션

프로젝트·전시·연구는 별도 페이지 대신 슬라이드인 패널/모달로 표시됩니다.

- `/diagram` → 노드 클릭 → `diagram/modal/projects/[id]` (URL이 변경되지만 레이아웃은 유지)
- 직접 접근 경로 `/projects/[id]`도 존재 — `projects/[id]/page.tsx`가 동일한 `ProjectModal` 컴포넌트를 사용

이 설계는 "작업들의 관계"를 탐색하는 흐름을 유지하면서 딥링크도 허용하기 위한 선택입니다.

## 캔버스 기반 시각화

홈 페이지(`app/page.tsx`)와 다이어그램(`components/MediaDiagramMotion.tsx`) 모두 캔버스를 사용합니다.

- **홈**: 지도 위 마스킹 레이어 — 마우스 이동·스크롤로 반경이 변하는 radial gradient로 배경을 드러냄. 핀 위치는 실제 지리 좌표 기반이 아니라 이미지 픽셀 좌표로 하드코딩.
- **다이어그램**: `Nodes.json`의 `px`/`py` 좌표를 기준으로 노드 배치. 노드 간 연결선은 캔버스에 직접 그림.

## 이중언어 구조

언어 상태(KO/EN)는 전역 store 없이 컴포넌트별로 관리합니다. 상위 컴포넌트가 `lang` state를 자식에게 props로 전달하는 방식.

데이터 구조:
```ts
{ en: "Title", ko: "제목" }
```

`CustomMarkdown.tsx`는 `#project:ID` 문법을 파싱해 내부 모달 링크로 변환합니다 — 마크다운 본문에서 다른 작업으로 연결할 때 사용.

## URL 리다이렉트

`next.config.ts`에 영구 리다이렉트가 설정되어 있습니다:

- `/playhomesweethome` → `/projects/play-home`
- `/makehomesweethome` → `/projects/make-home`

외부에서 공유된 단축 URL을 유지하기 위한 것으로, 변경 시 기존 링크가 깨집니다.

## SSR 주의사항

`instrumentation.ts`가 `localStorage`를 SSR 환경에서 no-op으로 폴리필합니다. 새 컴포넌트에서 브라우저 전용 API를 쓸 때 별도 `typeof window` 가드는 불필요하지만, `sessionStorage` 등 다른 Web API는 직접 가드해야 합니다.
