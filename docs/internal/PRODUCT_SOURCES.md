# 상품별 이미지 출처 (내부 문서)

최종 갱신: 2026-11-26 야간 작업.
이미지 파일은 2026-11-27부터 git에도 있습니다(운영자 결정). 위치는 `public/assets/…`입니다.
B·C·D 원본은 모두 KURIO 홈페이지 프로젝트(`C:\CLAUDE\KRUIO\kurio-public-web\media\products\…`)에 이미 등록되어 있던 판매처 사진입니다. 새로 내려받은 이미지는 없습니다.
브리프의 후보 URL은 같은 사진이거나 더 작은 버전이었습니다(아래 "후보 URL 대조" 참조).

## A · 와유재 백자 달항아리 (v4, 최종)
| 컷 | 파일 | 원본 | 비고 |
|---|---|---|---|
| ① | `assets/A_moonjar/01_product_v4.png.png` (941×1672) | 기획 담당자 제공. 와유재 사진(cdn.imweb.me/…/454902a9bbc08.jpg)의 달항아리로 만든 스튜디오 이미지 | 제작 방식(합성·생성 여부) 기록 없음 |
| ② | `products/a-moon-jar/02-detail.png` 왼쪽 절반 (712×900) | 와유재 상세 '\| Detail' (cdn.imweb.me/…/b9bbf1a24010e.png) | 기획 담당자의 `02_detail.png`와 같은 사진. 원본 해상도 사용 |
| ③ | `assets/A_moonjar/03_making.png` (384×492) | 와유재 제작 과정 사진(cdn.imweb.me/…/f8058a54c5197.png)의 오른쪽 절반(손만) | 2.81배 확대. `03_making_original.png`(얼굴 있음)는 보존만 함 |
| ④ | `assets/A_moonjar/04_in_place_v4.png.png` (941×1672) | 기획 담당자 제공. 콘솔 위 연출 | 제작 방식 기록 없음 |

## B · 국가무형유산 전통 흑립 (v1)
판매처: idus 작가 '국가무형유산 갓' — https://www.idus.com/v2/product/83066306-f130-4850-acf5-5198550c61e1 (상품 id 1718217)

| 컷 | 파일 | KURIO 원본 | 내용 |
|---|---|---|---|
| ①·④ | `assets/B_traditional_gat/01_product.jpg` (667×1001) | `p-heritage-korean-gat/01-cover.jpg` | 흑립 + 구슬 갓끈. 배경이 균일한 #F5F5F5인 스튜디오 컷 |
| ② | `assets/B_traditional_gat/02_detail.jpg` (1440×1492) | `…/02-texture.jpg` | 위에서 본 양태의 죽사 짜임 |
| ③ | `assets/B_traditional_gat/03_making.jpg` (1440×1065) | `…/11-process.jpg` | 인두로 양태 형태를 잡는 장인의 손. 얼굴 없음 |

- **④는 연출용 합성입니다** (실제 촬영 아님). Remotion에서 만든 공통 세트(회벽, 창빛, 월넛 선반, 받침대) 위에 ①과 같은 사진을 multiply로 비파괴 합성했습니다. 받침대와 벽 그림자는 템플릿이 그린 것입니다.
- ①·④는 배경을 흰색으로 맞추기 위해 밝기를 ×1.0408(245→255) 조정했습니다. 제품 톤 변화는 1% 미만입니다.
- **사용하지 않은 사진:** `20/21/22-other.jpg`는 같은 작가의 다른 갓이라 섞지 않았습니다. `10-process`(옻칠 전 양태)와 `12-process`(견사 붙이기)는 예비입니다.
- **소재 확인:** 정보제공고시상 '소재 대나무'입니다. 말총은 표기되지 않았습니다. 그래서 스토리보드의 "Woven from horsehair."를 "A silhouette of Korean heritage."(브리프가 지정한 대체 문구)로, "Split bamboo and horsehair, woven by hand"를 "Split bamboo, woven by hand."로 바꿨습니다.
- **판매 갤러리:** 사진 4장에 서로 다른 갓이 최소 3점 있고, 판매 대상 갓이 어느 것인지 표시가 없습니다(주문 제작). 커버 사진의 갓도 "작가의 갓"으로만 소개됩니다.

## C · 고태 GAT 초립 흑색 접시·잔 1인 세트 (내부 검토 템플릿)
판매처: GOTAE — https://gotae.kr/GAT/?idx=1

| 컷 | 파일 | KURIO 원본 | 내용 |
|---|---|---|---|
| ① | `assets/C_gotae/01_product.jpg` (750×750) | `p-gotae-gat-chorip-black/01-cover.jpg` | 잔을 엎어 포갠 갓 형태 |
| ② | `assets/C_gotae/02_detail.jpg` | `…/02-packaging.jpg` | 접시, 잔, 종이 패키지 |
| ③ | `assets/C_gotae/03_making.jpg` | `…/04-detail.jpg` | 접시 단독(유약면) |
| ④ | — | — | **식탁 위 사용 사진 없음** |

- 미사용: `03-detail.jpg`(잔 단독).
- 사실: 소재 도자기, 경기도 이천의 국내 협력사가 모두 수공예로 제작(판매처 PRODUCT INFO).

## D · 박씨상방 까치호랑이 나전칠기 자개쟁반 18cm (v1)
판매처: 박씨상방 — https://koreasang.co.kr/product/detail.html?product_no=16318 (상품코드 P0000YDQ)

| 컷 | 파일 | KURIO 원본 | 내용 |
|---|---|---|---|
| ① | `assets/D_najeon/01_product.jpg` (1000×1000) | `p-tiger-magpie-najeon-plate/01-cover.jpg` | 받침대 위 쟁반 (2.0배) |
| ② | `assets/D_najeon/02_detail.jpg` | `…/02-detail.jpg` | 호랑이와 까치 확대 (1.4배) |
| ③ | `assets/D_najeon/02_detail.jpg` 왼쪽 아래 | `…/02-detail.jpg` | 자개 조각(모란, 나비, 회문 테두리) (2.7배) |
| ④ | `assets/D_najeon/04_in_place.jpg` | `…/05-in-use.jpg` | 흰 테이블, 창빛, 조명 옆 (1.92배) |

- `03_making.jpg`(`03-angle.jpg`, 위에서 본 쟁반)는 복사해 두었지만 최종 컷에는 쓰지 않았습니다.
- **모든 크롭에서 제3자 소품 책('designselect' 표지)을 뺐습니다.**
- 사실: 재료 자개와 목재, 흑칠 바탕, 국내 생산(박씨상방), 수공예, 지름 18cm, 받침대 포함. 호랑이는 수호, 까치는 좋은 소식을 뜻합니다(판매처 설명). 민화 원화가 아니므로 "Hand-painted on hanji paper"는 쓰지 않았습니다.

## 브리프 후보 URL 대조
- B 후보 `image.idus.com/…_720.jpg` 4개: idus 갤러리 이미지(720px 이하)로, 서로 다른 갓이 섞여 있습니다. KURIO에 이미 등록한 커버와 더 큰 상세·과정 사진을 썼습니다. 내려받지 않았습니다.
- C 후보 `cdn-optimized.imweb.me/…?w=750` 4개: KURIO 등록본(750×750)과 같은 4장입니다.
- D 후보 `koreasang.co.kr/web/product/extra/small/…` 6개: 작은 썸네일입니다. KURIO 등록본(1000×1000)이 같은 사진의 더 큰 버전입니다.
