# KURIO-ADS 인수인계 (2026-11-26 야간 작업 → 회사 컴퓨터 재개용)

**내부 문서입니다.** 2026-11-27부터 이미지·영상·내부 문서도 git에 있습니다(운영자 결정, 저장소는 비공개로 전환 예정).
아래의 "로컬 전용", "직접 옮겨야 한다", 브랜치 전환 경고는 그 전 상태의 설명입니다. 이제 `git clone`만으로 전부 받습니다.
- 로컬 위치: `C:\CLAUDE\KURIO-ADS\docs\internal\`
- 함께 볼 문서: [PRODUCT_SOURCES.md](PRODUCT_SOURCES.md), [RIGHTS_STATUS.md](RIGHTS_STATUS.md), [REVIEW_REPORT.md](REVIEW_REPORT.md), [STORYBOARD.md](STORYBOARD.md), [VIDEO_PRODUCTION_PROMPT.md](VIDEO_PRODUCTION_PROMPT.md)
- 공개 문서(저장소 안): `README.md`, `DESIGN_SYSTEM.md`, `RENDER_GUIDE.md`

## 1. 오늘 완료한 작업
- 공개 저장소용 깨끗한 `main` 브랜치를 만들었습니다. 이전 기록과 연결되지 않은 새 기록이고, 코드·디자인 시스템·OFL 폰트만 담았습니다. 사진, 영상, 내부 문서는 없습니다.
- B·C·D 작업 브랜치 `feature/meta-creative-bcd`를 만들었습니다.
- 공통 템플릿을 확장했습니다: matte 합성, 공통 IN PLACE 세트, 벽 그림자, `status: review`, 빈 컷에 안내 문구를 쓰지 않는 규칙. **A의 결과는 바이트 단위로 동일함을 확인했습니다.**
- 영상: B v1과 D v1 MP4를 렌더링했고, C는 내부 검토 스틸만 만들었습니다(보류). A v4는 보존했습니다(다시 렌더링하지 않음).
- 자체 검수: A 89, B 81, D 85, C 53(보류). 상세는 REVIEW_REPORT.md에 있습니다.

## 2. 영상과 버전
| 광고 | 버전 | 상태 | 파일 (`C:\CLAUDE\KURIO-ADS\out\…`) |
|---|---|---|---|
| A 와유재 백자 달항아리 | **v4** | 최종 후보 (권한 미확보) | `A-moon-jar-v4\KURIO_AD_A_MOON_JAR_v4.mp4` (4.0MB) |
| B 국가무형유산 전통 흑립 | **v1** | 1차 시안 (④는 연출 합성, 권한 미확보) | `B-traditional-gat-v1\KURIO_AD_B_TRADITIONAL_GAT_v1.mp4` (22.6MB) |
| C 고태 GAT 초립 흑색 | — | **보류, 내부 검토 템플릿** (MP4 없음) | `C-gotae-gat-review\stills\…_INTERNAL_REVIEW_DRAFT_*.png` |
| D 박씨상방 까치호랑이 자개쟁반 | **v1** | 1차 시안 (권한 미확보, 판매처의 재이용 금지 고지 있음) | `D-tiger-magpie-v1\KURIO_AD_D_TIGER_MAGPIE_v1.mp4` (11.7MB) |
| 공통 엔드카드 | v4 | 네 편이 같은 파일 사용 | `shared\KURIO_ENDCARD_v4.mp4` (+ `.png`) |
| 4편 비교 | — | 검수용 | `KURIO_ADS_A-D_overview_261126.png` |

- 각 폴더에 썸네일(`KURIO_AD_<X>_THUMBNAIL_v*.png`)과 `stills\` 장면 스틸 5장이 있습니다.
- 이전 버전 A v1·v2·v3도 `out\`에 보존했습니다.

## 3. GitHub
- 저장소: https://github.com/jeonjw19987-svg/kurio-ads (**공개**)

| 브랜치 | 커밋 | 내용 |
|---|---|---|
| `main` | `ad010db` | A v4 기반 공통 템플릿 (공개 범위만, 이전 기록과 연결되지 않은 새 기록) |
| `feature/meta-creative-bcd` | `5f6b568` | main + B·C·D 상품 설정, 템플릿 확장, 문서 (이미지·영상·내부 문서 없음) |
| `feature/meta-ad-production` | `d534a05` | **이전 작업 브랜치. 와유재 사진·기획 담당자 이미지·내부 문서가 들어 있음** (운영자 결정으로 공개 push됨) |
| 태그 `ad-a-v2`·`ad-a-v3` | — | 위 이전 브랜치의 커밋을 가리킴 (사진 포함) |

⚠ **이 노트북에서 `feature/meta-ad-production`으로 전환(`git switch`)하지 마세요.**
- 그 브랜치는 이미지와 내부 문서를 git으로 추적합니다.
- 전환했다가 `main`이나 `feature/meta-creative-bcd`로 돌아오면, git이 `public/assets/` 등 로컬 이미지와 `docs/internal/`의 일부 문서를 지울 수 있습니다.
- 이전 버전을 볼 때는 `git show <커밋>:<경로>` 또는 별도 폴더의 `git worktree`를 씁니다.

**사용자 조치가 필요한 것:**
1. GitHub의 기본 브랜치가 아직 `feature/meta-ad-production`입니다. Settings → General → Default branch에서 `main`으로 바꿉니다.
2. 새 공개 범위 원칙에 맞추려면 `feature/meta-ad-production` 브랜치와 태그 `ad-a-v2`·`ad-a-v3`를 원격에서 삭제할지 결정합니다. 삭제는 되돌릴 수 없고, 캐시나 포크에는 남을 수 있습니다. 이번 작업에서는 삭제하지 않았습니다.
3. GitHub Release(`v0.1.0-preview`)는 **보류**했습니다. 공개 승인과 이미지 사용 권한이 확보된 영상이 없습니다. 이 PC에 `gh` CLI도 없습니다.

## 4. 회사 컴퓨터에서 복구하기
```powershell
git clone https://github.com/jeonjw19987-svg/kurio-ads.git KURIO-ADS
cd KURIO-ADS
git switch feature/meta-creative-bcd
npm ci                    # Node 20.19 이상. node_modules는 복사하지 않음
```
**git에 없는 파일을 이 노트북에서 직접 옮겨야 합니다.** 승인된 비공개 전달 수단이 설정되어 있지 않아 외부 서비스에 올리지 않았습니다.

| 옮길 것 (노트북 경로) | 크기 | 용도 |
|---|---|---|
| `C:\CLAUDE\KURIO-ADS\public\assets\` (A_moonjar, B_traditional_gat, C_gotae, D_najeon) | 8.1MB | 상품 이미지 (렌더링 필수) |
| `C:\CLAUDE\KURIO-ADS\public\products\a-moon-jar\` | 2.7MB | A ②의 원본 |
| `C:\CLAUDE\KURIO-ADS\docs\internal\` | 0.1MB | 내부 문서 |
| `C:\CLAUDE\KURIO-ADS\out\` | 97MB | 결과 영상·스틸 (검수용. 필요한 것만 옮겨도 됨) |
| (선택) `C:\CLAUDE\KURIO-ADS\archive\` | 3.9MB | A v1 소스 재구성본 |

경로는 저장소 안의 같은 위치에 그대로 넣습니다.

```powershell
npm run dev               # Remotion Studio → http://localhost:3000 (KURIO-Ads 폴더에 Ad-A~D)
npm run a:render          # A v4 다시 렌더링 (보통 불필요)
npm run b:render          # B v1 → out/B-traditional-gat-v1/
npm run c:stills          # C 내부 검토 스틸 (MP4 없음)
npm run d:render          # D v1 → out/D-tiger-magpie-v1/
npm run b:stills          # 등: 스틸·썸네일만 빠르게
```
- 첫 렌더링 때 Chrome Headless Shell(약 130MB)을 자동으로 받습니다.
- 엔드카드 마스터(`out/shared/KURIO_ENDCARD_v4.mp4`)가 없으면 한 번 새로 만듭니다. 결정적으로 렌더링되므로 내용은 같지만, 같은 파일을 쓰려면 `out\shared\`도 함께 옮깁니다.

## 5. 영상별 개선 필요 사항 (요약 — 상세는 REVIEW_REPORT.md)
- **A:** 판매처·작가 허락, 01·04 이미지 제작 경위 기록, ③ 고해상도 원본.
- **B:** 실내 연출 실사진(지금 ④는 합성), 판매 대상 갓 확인, 판매처 허락.
- **C:** 허락과 브랜드 노출 범위, ④ 식탁 사진, 밝은 배경의 ① 사진, 고해상도 원본. 승인 후 `status: "final"`로 바꾸고 `c:render` 스크립트를 추가합니다.
- **D:** 서면 허락(필수), 고해상도 원본, 원목 콘솔 연출 사진(④), 색온도 통일 여부 결정.
- **공통:** 네 편 ④의 제작 방식이 다릅니다(A 제공 이미지, B 합성, D 판매처 사진). 수요 비교의 공정성을 위해 통일을 권합니다.

## 6. Meta 광고 등록 전 확인할 것
- [ ] 각 판매처·작가의 서면 사용 허락(광고, 매체, 미국, 기간). D는 필수, C는 허락 전 제작 보류.
- [ ] A ①·④, B ④(연출 합성)에 대한 Meta AI·합성 콘텐츠 고지 기준 확인.
- [ ] 영상 안에 가격, 할인, 배송 문구가 없는지(현재 없음). 랜딩의 $55와 배송 문구는 랜딩에서만.
- [ ] 금지 항목 재확인: 영화·유명인 언급, "moon jar" 단독 표기, 시즌 소구, 갓 착용 컷 — 현재 없음.
- [ ] 광고 문구(Primary text, Headline, CTA)는 스토리보드의 Meta 문구 세트를 씁니다. 다만 B의 "horsehair" 표현은 소재 확인 전까지 쓰지 않습니다.
- [ ] Ads Manager에서 상품별 랜딩 URL과 CTA('Learn More' 영상 버튼과 일치) 연결.
- [ ] 실제 송출과 결제는 아직 하지 않았습니다.

## 7. 디스크
작업 종료 시 C: 여유 공간 40.3GB. 이번 작업에서 추가된 용량은 약 50MB(이미지 3.8MB, 영상·스틸 약 45MB)입니다. 기존 파일과 캐시는 지우지 않았습니다.
