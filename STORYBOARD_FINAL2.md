# KURIO Meta 광고 수정본 스토리보드 (v2, 2026-11-26)

기준 문서는 기획 담당자의 「KURIO 광고소재 수정요청서 261126 v2」(저장소 밖)입니다. 이전 최종본 기록 [STORYBOARD_FINAL.md](STORYBOARD_FINAL.md)와 최초 스토리보드(`STORYBOARD.md`, 브랜치 `feature/meta-ad-production`)는 그대로 보존합니다.

**상태:** 네 편 모두 수정해 다시 렌더링하고 검수했습니다. 이미지 사용 허락을 받지 못해 **내부 검수용**입니다. Meta 광고 송출과 결제는 하지 않았습니다.

## 0. 광고 기호 대응
요청서의 A–D는 저장소의 광고 코드와 B·D가 서로 바뀌어 있습니다. **파일명은 요청서 기호를 따릅니다.**

| 요청서 · 파일명 | 상품 | 저장소 컴포지션 / 상품 파일 |
|---|---|---|
| A | 백자 달항아리 | `KURIO-AD-A-MOON-JAR` / `a-moon-jar.ts` |
| B | 까치호랑이 자개접시(나전칠기) | `KURIO-AD-D-TIGER-MAGPIE` / `d-tiger-magpie.ts` |
| C | GOTAE 갓 테이블웨어 | `KURIO-AD-C-GOTAE-GAT` / `c-gotae-gat.ts` |
| D | 전통 갓(흑립) | `KURIO-AD-B-TRADITIONAL-GAT` / `b-traditional-gat.ts` |

## 1. 요청서 체크리스트 반영
| 항목 | 반영 |
|---|---|
| 1080×1920 재렌더 | 반영(30fps, 15.000초). 원래 납품 파일도 1080×1920 30fps였습니다. 요청서의 406×720 24fps는 카카오톡이 동영상을 보낼 때 압축한 결과입니다. 앞으로는 **파일로 보내기(압축 파일)나 드라이브 링크**로 전달하면 화질이 유지됩니다 |
| 첫 프레임 1·2·3행 교체 | 반영. 단, D(갓) 3행은 아래 §3 참고 |
| C 배경을 따뜻한 오프화이트로 | 반영. 상품을 스튜디오 사진에서 오려 KURIO 바탕색(#F4F1EC) 위에 두었습니다. 상품 그림자는 원본 사진의 그림자를 그대로 옮겼습니다 |
| C 제품 20~30% 확대, 중앙, 잘림 제거 | 중앙 배치와 잘림 없음은 반영했습니다. 확대는 1.4%에 그쳤습니다. 접시 챙이 이미 화면 폭의 92%(1012/1080px)라 20~30% 키우면 양쪽이 잘립니다 |
| D 제목 1줄 | 반영. 네 편 제목을 모두 66px로 통일했습니다(운영자 결정, §4) |
| 영어 10건 | 반영(D① 3행만 대체 문구) |
| D③ woven → shaped | 반영 |
| 엔드카드 `Shop now` | 반영. 흰색 외곽선 버튼, 로고 아래 중앙. 엔드카드는 한 번만 렌더링해 네 편에 같은 파일을 붙였습니다(디코딩 결과 동일 확인) |
| 썸네일 4장 | 반영(① 컷, 1080×1920) |
| 파일명 `KURIO_AD_A~D_2611XX_v2.mp4` | `KURIO_AD_A_261126_v2.mp4` ~ `KURIO_AD_D_261126_v2.mp4` |

## 2. 최종 자막 (요청서 기호)
| 비트 | A 달항아리 | B 자개접시 | C 고태 | D 갓 |
|---|---|---|---|---|
| ① 0–3초 | Korean moon jar. / Dalhangari. / Shaped like the moon. | Korean mother-of-pearl plate. / Najeonchilgi. / A tiger and a magpie. | Korean gat tableware. / GOTAE. / A plate and a cup that stack. | Traditional Korean hat. / Gat. / **Finely woven, lacquered black.** |
| ② 3–6초 | An 18th-century Joseon form — / never perfectly round. | The tiger wards off bad luck. / The magpie brings good news. | The brim of a Korean hat / becomes the plate. / The crown becomes the cup. | Worn by Joseon scholars — / light enough to see through. |
| ③ 6–9초 | Thrown on the wheel, / glazed by hand. | The art of mother-of-pearl inlay. | Designed and made in Korea. | Split bamboo, / shaped by hand. |
| ④ 9–12초 | Quiet on a console table. | On the shelf, facing the door. | Korean design, for every day. | On display, not in a box. |
| ⑤ 12–15초 | Curious about Korea → KURIO → Shop now | 같음 | 같음 | 같음 |

- **줄바꿈:** ① 제목은 네 편 모두 한 줄입니다. "/"는 화면의 줄바꿈입니다.
- **C ②:** "The brim of a Korean hat becomes the plate."가 화면 폭(904px)보다 길어(1026px) 자연스러운 곳에서 나눴습니다. C ②만 세 줄입니다.
- **확인 도구:** 모든 줄의 폭은 `npm run copy:fit`(실제 SUIT 글꼴로 Remotion에서 측정)으로 확인했습니다.

## 3. 상품 정보 확인
- **D(갓) ① 3행:** 요청은 "Woven from horsehair."였습니다. 판매처 상품 정보의 소재는 대나무(양태를 죽사로 엮고 옻칠로 검게 함)이고, 말총은 갓 일반 설명에만 나옵니다. 운영자 결정(2026-11-26)으로 확인된 사실 **"Finely woven, lacquered black."**을 썼습니다. 판매처가 말총 사용을 확인해 주면 이 한 줄만 바꿔 다시 렌더링하면 됩니다.
- **A ③ "Thrown on the wheel, glazed by hand.":** 판매처의 제작 사진(③ 화면)에 물레 위에서 빚는 손이 보입니다. 판매처 문구도 "도예가가 손으로 빚고 직접 만든 유약을 입힘"입니다. 두 반쪽 접합 방식은 여전히 쓰지 않습니다.
- **B(자개접시):** 문양은 이전 FINAL처럼 실물 사진입니다(②④ 쟁반은 판매처 사진으로 교체한 합성). ③은 공예 일반을 보여 주는 장면이며 이 상품의 제작 과정이 아닙니다.
- **C:** 2행 `GOTAE`는 브랜드명입니다. 고태 측 사용 허락은 아직 받지 못했습니다.

## 4. 디자인 변경 (design "v7")
| 항목 | 이전(v6) | v7 |
|---|---|---|
| ① 제목 | SUIT SemiBold 88px, 필요하면 두 줄 | SUIT SemiBold **66px**, 네 편 모두 한 줄. 가장 긴 제목 "Korean mother-of-pearl plate."이 88px에서 1178px라, 네 편 크기를 같게 유지하려고 함께 줄였습니다(운영자 결정) |
| 현지어명·설명·②③④ 자막 | 46px / 54px | 그대로 |
| 자막 위치·모션 | ① y 214, ②③④ y 284 | 그대로 |
| C ① 화면 | 회색 스튜디오 사진(soft 배치) | 오려 낸 상품을 KURIO 바탕색 위 가운데에 배치(`cutout`, `npm run composite:c`) |
| 엔드카드 | v5: Curious about Korea → KURIO | v6: v5 + 13.8초부터 "Shop now" 흰색 외곽선 버튼(LINE Seed Sans 42px, 테두리 2px). `out/shared/KURIO_ENDCARD_v6.mp4` 한 개를 네 편에 붙임 |
| 음악·하드컷·길이 | 공통 음원, 컷당 3초 | 그대로 |

## 5. Meta 광고 문구 (초안 — 운영자 승인 전, 송출하지 않음)
가격·할인·무료배송·도착일·시즌·선물 문구는 쓰지 않았습니다. 확인된 사실만 썼고, CTA 버튼은 엔드카드와 같은 **Shop Now**입니다.

| 편 | Primary text | Headline | Description |
|---|---|---|---|
| A | A Korean moon jar, thrown on the wheel and glazed by hand. An 18th-century Joseon form, never perfectly round. | Korean moon jar | Quiet on a console table. |
| B | A Korean mother-of-pearl plate (najeonchilgi) with a tiger and a magpie. The tiger wards off bad luck; the magpie brings good news. | Korean mother-of-pearl plate | On the shelf, facing the door. |
| C | Korean gat tableware by GOTAE: a plate and a cup that stack. The brim of a Korean hat becomes the plate; the crown becomes the cup. | Korean gat tableware by GOTAE | Korean design, for every day. |
| D | The gat, the traditional Korean hat of Joseon scholars. Split bamboo, shaped by hand, light enough to see through. | Traditional Korean hat | On display, not in a box. |

## 6. 이미지·음원 출처와 사용 권한
이전 최종본과 같습니다([STORYBOARD_FINAL.md](STORYBOARD_FINAL.md) §6).
- 네 편 모두 판매처의 서면 이미지 사용 허락이 없어 내부 검수용입니다.
- 음원은 KURIO 자체 제작이라 상업 광고에 쓸 수 있습니다.
- C ①은 GOTAE 상품 사진을 오린 연출 합성이고, 상품 픽셀은 그대로입니다.

## 7. 출력 파일
위치는 `out/FINAL2/`입니다(git 제외, 로컬 전용).

| 파일 | 상품 |
|---|---|
| `KURIO_AD_A_261126_v2.mp4` · `_SILENT.mp4` · `_THUMBNAIL.png` | A 달항아리 |
| `KURIO_AD_B_261126_v2.mp4` · `_SILENT.mp4` · `_THUMBNAIL.png` | B 자개접시 |
| `KURIO_AD_C_261126_v2.mp4` · `_SILENT.mp4` · `_THUMBNAIL.png` | C 고태 |
| `KURIO_AD_D_261126_v2.mp4` · `_SILENT.mp4` · `_THUMBNAIL.png` | D 갓 |

- 네 편 비교 이미지는 `KURIO_ADS_A-D_261126_v2_review.png`입니다.
- 렌더 작업 폴더(장면 스틸, 렌더 보고서)는 `_render/`입니다.
- 이전 납품본은 `out/FINAL/`에 그대로 있습니다.

## 8. E — 갓 벽시계 (2026-11-26 추가)
홈페이지의 광고 상품 C가 2026-11-26 운영자 결정으로 GOTAE 초립 세트에서 뮷즈 갓 벽시계(GAT Wall Clock)로 바뀌었다. 이 광고는 다섯 번째 편 **E**로 만든다.
- 저장소 컴포지션: `KURIO-AD-E-GAT-CLOCK`
- 상품 파일: `e-gat-clock.ts`
- 디자인 v7, 엔드카드 v6, 공통 음원은 A–D와 같다. 바뀌는 것은 사진과 자막뿐이다.

| 비트 | 자막 | 화면 |
|---|---|---|
| ① 0–3초 | Korean gat wall clock. / Gat sigye. / No hands. Two layers turn. | 흰 벽의 시계를 KURIO 바탕색(#F4F1EC) 위로 옮긴 합성(`npm run composite:e`). 벽에 대한 밝기 비율을 그대로 옮겨 시계·무늬·그림자가 사진과 같다 |
| ② 3–6초 | Inspired by the gat, / the hat of Joseon scholars. | 검은 원목 중심부와 아크릴 원판 근접(갓의 모자·양태) |
| ③ 6–9초 | Precision-cut acrylic, / solid wood. | 금속 선반에 둔 시계 정면 |
| ④ 9–12초 | On the wall, keeping time. | 흰 벽의 시계(원본 사진 그대로) |
| ⑤ 12–15초 | Curious about Korea → KURIO → Shop now | A–D와 같은 엔드카드 파일 |

- ④는 기획 문구다. ①–③은 판매처 상세 이미지에 적힌 사실로 A–D 형식에 맞춰 썼다.
  - 흑립의 구조미를 인테리어 오브제로 재해석했다.
  - 바늘이 없고, 직선·곡선 무늬의 아크릴 두 장이 시침·분침 역할을 한다.
  - 정밀 레이저·미세 가공, 아크릴과 원목을 썼다.
- 쓰지 않은 것: 가격, 제조사 이름, A/S, 박물관 공식 제휴 같은 표현.
- 줄 폭은 `npm run copy:fit`으로 확인했다. 가장 긴 줄은 621px로, 허용 폭은 904px다.
- **사진**: 판매처(뮷즈 국내몰)가 자동화 브라우저를 막아 우회하지 않았다. 운영자가 페이지 이미지를 저장해 주었다.
  - 홈페이지 작업에서 사진 칸을 잘라 Lanczos로 2배 키웠다(약한 선명도 보정, AI 없음).
  - 파일은 `public/assets/E_gat_clock/`에 있고 git에서 제외된다.
  - 다른 출판사 책 제목이 크게 보이는 사진 1장은 쓰지 않았다.
  - 서면 사용 허락은 없다(A–D와 같은 운영자 결정).
- **출력**: `out/FINAL2/`에 `KURIO_AD_E_261126_v1.mp4`, `_SILENT.mp4`, `_THUMBNAIL.png`
  - 렌더 명령은 `npm run e:render`, 스틸만 뽑을 때는 `npm run e:stills`다.

**Meta 광고 문구 초안** (운영자 승인 전, 송출하지 않음)
- Primary text: A Korean gat wall clock with no hands — two precision-cut acrylic layers turn as the hours pass. Inspired by the gat, the hat of Joseon scholars.
- Headline: Korean gat wall clock
- Description: On the wall, keeping time.
