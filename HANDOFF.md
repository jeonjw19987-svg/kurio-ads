# KURIO-ADS 인수인계 (2026-11-26)

KURIO 미국 Meta 광고(A·B·C·D) 영상을 Remotion으로 만드는 프로젝트입니다. 홈페이지 저장소(`C:\CLAUDE\KRUIO\kurio-public-web`)와는 별개이고, 그쪽은 읽기만 합니다.
사양은 [STORYBOARD.md](STORYBOARD.md), 작업 지시는 [VIDEO_PRODUCTION_PROMPT.md](VIDEO_PRODUCTION_PROMPT.md)에 있습니다.

## 1. 현재 상태
| | |
|---|---|
| 브랜치 | `feature/meta-ad-production` (이 저장소 첫 커밋, 2026-11-26) |
| 원격 | **없음.** 지시에는 '기존 feature/meta-ad-production 브랜치'라고 되어 있었지만, 이 PC에도 GitHub(`kurio-public-web`)에도 그 브랜치가 없었습니다. 이 저장소는 원격이 설정되지 않아 push 대상이 정해지지 않았습니다 |
| A v1 | `out/A-moon-jar-v1/` (2026-11-25). 이전 채팅 브리프 기준. 보존하며 덮어쓰지 않습니다. v1 소스는 git에 없습니다(당시 첫 커밋이 git 사용자 설정 부재로 실패). 설명은 `docs/AD-A-MOON-JAR.md` |
| **A v2** | `out/A-moon-jar-v2/` (2026-11-26). 스토리보드 v2 기준. ④ IN PLACE 자료가 없어 공개 집행용은 아닙니다 |
| 엔드카드 마스터 | `out/shared/KURIO_ENDCARD_v2.mp4` (90프레임). B·C·D도 이 파일을 그대로 씁니다 |
| B·C·D | 아직 만들지 않음 |
| Remotion | 4.0.547, Node 26.13.1. 플러그인 `remotion@remotion`, Skills 14개 설치됨 |

`out/`은 `.gitignore` 대상입니다. 영상, 스틸, 비교 자료는 git에 들어가지 않으니 파일로 따로 보관합니다.

## 2. 실행
```
npm run dev                      # Remotion Studio (기본 http://localhost:3000)
npx remotion studio --port 3123  # 다른 포트로 열 때
```
Studio의 `KURIO-Ads` 폴더 구성:
- `KURIO-AD-A-MOON-JAR`: 15초 전체 미리보기
- `KURIO-AD-A-MOON-JAR-BODY`: 12초 본편
- `KURIO-EndCard`: 엔드카드

## 3. 렌더링 (번들 1회, 캐시 없음)
```
node tools/render-ad.mjs KURIO-AD-A-MOON-JAR out/A-moon-jar-v2 KURIO_AD_A_MOON_JAR_v2 --stills-only   # 스틸 5장 + 썸네일
node tools/render-ad.mjs KURIO-AD-A-MOON-JAR out/A-moon-jar-v2 KURIO_AD_A_MOON_JAR_v2                 # + MP4
```
- 최종 MP4는 12초 본편과 엔드카드 마스터를 **재인코딩 없이** 연결해 만듭니다(ffmpeg concat, `-c copy`).
- 두 파일의 인코딩 설정은 같습니다: H.264, crf 18, yuv420p, bt709, 무음.
- 엔드카드 마스터는 없을 때만 렌더링합니다. 엔드카드를 고쳤다면 `--rebuild-endcard --endcard-version=v3`처럼 버전을 올리고, 네 편을 모두 다시 만듭니다.
- v2 확인 결과: 450프레임, 15.000초. 최종본 13.5초·14.95초 프레임이 마스터 1.5초·2.95초 프레임과 MD5가 일치합니다.

## 4. 제품 실루엣 추출 (①·② 컷아웃)
새 패키지 없이 Windows .NET과 Node만 씁니다. Python, OpenCV, GPU 매팅 모델은 설치하지 않았습니다(저장공간).
1. 제품 사진을 1000×1000 BGR 원시 파일로 만듭니다. PowerShell System.Drawing을 쓰며, 방법은 `tools/check-silhouette.ps1`과 같은 방식입니다.
2. `node tools/trace-silhouette.cjs <in.bgr> <contour.json>`을 실행합니다. 중심에서 방사선으로 바깥쪽 색 경계를 찾고, 이상값을 보정한 뒤 평활화합니다. 입구 구간은 모서리가 살도록 약하게만 평활화합니다.
3. `powershell -File tools/check-silhouette.ps1 <contour.json> <overlay.png>`로 빨간 윤곽선을 사진 위에 그려 눈으로 확인합니다.
4. `node tools/contour-to-ts.cjs <contour.json> src/ads/products/<id>.silhouette.ts <exportName> <사진경로>`를 실행합니다. 윤곽을 4px 안쪽으로 줄여 배경색이 묻어나지 않게 합니다.

중심점(`cx, cy`)과 반경 범위는 달항아리 기준값입니다. 다른 제품은 스크립트 상단 값을 조정해야 합니다.

## 5. 템플릿 구조
```
src/ads/template/
  tokens.ts            규격·색·Reels 안전 영역·자막·스테이지·그림자·푸시인 고정값
  types.ts             ProductAd / AdScene / CutVisual(cutout | bleed | missing)
  Visuals.tsx          컷아웃 스테이지(그림자 포함), 화면 위쪽 사진+아래로 흐려짐, PHOTO NEEDED 표시, 푸시인
  Caption.tsx          하단 자막(아래 끝 y=1240, Regular 64px, ①은 0프레임, 나머지는 0.3초 후)
  EndCard.tsx          공용 엔드카드(입력값 없음)
  ProductScene.tsx / ProductAdVideo.tsx
src/ads/products/
  a-moon-jar.ts            A 데이터(자막·컷별 자료·출처)
  a-moon-jar.silhouette.ts 생성 파일(직접 수정 금지)
tools/                     render-ad.mjs, trace-silhouette.cjs, contour-to-ts.cjs, check-silhouette.ps1
public/products/a-moon-jar 01-cover.jpg, 02-detail.png (와유재 사진, KURIO 등록본을 그대로 복사)
public/fonts/line-seed     LINE Seed Sans Thin/Regular (SIL OFL 1.1)
```

## 6. A v2에서 바꾼 것 (v1 대비)
- 사각형 사진 틀을 없앴습니다.
  - ①② 제품을 실루엣으로 분리해 #F4F1EC 위에 놓고, 좌측광 기준으로 오른쪽에 접지·그림자를 넣었습니다.
  - ③ 사진이 화면 위쪽을 채우고 아래로 흐려집니다.
- 자막을 위쪽 Thin 76px에서 아래쪽 Regular 64px로 옮겼습니다. 표시 시점은 0.3초 후이고, ①만 첫 프레임부터 나옵니다.
- 카메라는 좌우 이동·풀백을 없애고, 모든 컷을 일정 속도 푸시인 1회로 바꿨습니다.
- 카피는 스토리보드 문구로 되돌렸습니다. ③만 근거가 없어 대체 문구를 썼습니다(STORYBOARD.md §3).
- ③을 2장 콜라주에서 제작 흔적 한 화면으로 바꿨습니다.
- ④는 와유재 매장 사진(24cm) 대신 'PHOTO NEEDED'를 표시합니다. 제품 확대 사진이나 생성 이미지로 대체하지 않았습니다.
- 엔드카드: 문구를 Learn More로 하고, 워드마크(112→176px)와 CTA(26→46px, 외곽선 3px)를 키웠습니다. 0.3초 간격으로 표시하고, 마스터 파일 1개를 연결합니다.

## 7. 추가로 확보해야 할 자료
| # | 컷 | 필요한 것 | 조건 | 지금 있는 후보 |
|---|---|---|---|---|
| 1 | ④ IN PLACE | 이 달항아리가 현대 주거 공간의 콘솔이나 선반 위에 놓인 **실제 사진 또는 3초 이상 고정 영상** | 16cm 반무광 제품. 여백 넉넉히, 좌측 측광, 소품은 받침대 수준. 세로 원본 높이 2160px 이상(또는 4K 영상). 정면이나 약간 위 시점 | 와유재 상세페이지 `…/425c550184aa9.jpeg`(티크 사이드보드 위 한 점, 480×430). 고해상도 원본과 허락이 필요합니다 |
| 2 | ③ MAKING | 신동범 작가가 물레에서 작업하는 **손만 나오는 영상 또는 사진** | 얼굴 금지. 실제 제작 방식(한 번에 빚는지, 두 반쪽을 잇는지) 확인 포함 | `…/f8058a54c5197.png` 오른쪽 절반(손만, 1440×900 중 절반). 왼쪽 절반은 얼굴이 나와 쓸 수 없습니다. 허락이 필요합니다 |
| 3 | ② DETAIL | 허리 접합선과 가마 얼룩 클로즈업 | 16cm에 접합선이 실제로 있는지 먼저 확인 | 없음 |
| 4 | ① PRODUCT | 정면, 무지 배경, 좌측광 스튜디오 컷(3000px 이상) | 네 편이 같은 세팅 | 지금 컷아웃은 비스듬한 위 시점입니다 |
| 5 | 전체 | 와유재·신동범세라믹스튜디오의 **광고 사용 서면 허락**(Meta, 미국, 기간) | 공개 집행의 전제 조건 | 운영자 결정(2026-11-25)만 있습니다 |
| 6 | 사실 | 제작 방식(두 반쪽 여부), 사진의 제품이 16cm인지 | ③ 원래 문구를 쓰려면 필요 | — |
| 7 | ⑤ | 확정된 KURIO 로고 파일 | 사이트도 임시 텍스트 워드마크를 씁니다 | 텍스트 워드마크(LINE Seed Sans Regular, 자간 0.32em) |

## 8. Higgsfield(생성형 영상) 검토 — 크레딧 사용 0
| 컷 | 판단 |
|---|---|
| ① ② | 필요 없습니다. 실사 사진과 Remotion 푸시인으로 충분합니다 |
| ③ MAKING | **쓰지 않습니다.** 생성한 제작 장면은 실제 작가의 작업처럼 보이게 되어 허위 표현이 됩니다 |
| ④ IN PLACE | 기술적으로 가능한 유일한 후보입니다(배경 공간만 생성하고 실제 제품 사진을 합성). 하지만 실제 집에 놓인 것처럼 보이는 상품 광고가 되므로 권장하지 않습니다. 쓴다면 운영자 승인, AI 생성 표시, Meta 정책 확인이 필요합니다. **촬영이 우선입니다** |
| ⑤ | 필요 없습니다 |

## 9. 주의
- 홈페이지 저장소, `main`, Production은 건드리지 않습니다. 사진과 폰트는 복사만 해 왔습니다.
- 와유재 사진은 공개 광고에 쓰기 전에 서면 허락을 받아야 합니다.
- 렌더링은 `tools/render-ad.mjs`로 합니다. `npx remotion render`를 반복하면 번들 캐시가 쌓입니다(`node_modules/.cache`, 현재 약 140MB).
