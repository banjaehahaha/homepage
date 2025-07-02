"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import CustomMarkdown from "@/components/CustomMarkdown";
import { soloList, groupList } from "@/components/cvList";
import Link from "next/link";
import ProjectModal from "@/projects/ProjectModal";

export default function CVPanel({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState<'en' | 'ko'>('en'); 
  const [modalProjectId, setModalProjectId] = useState<string | null>(null);
  const sortedSoloList = [...soloList].sort((a, b) => {
    if (b.year !== a.year) {
      return b.year - a.year; // 연도 내림차순
    }
    return a.order - b.order; // 같은 연도면 order 오름차순(1이 위)
  });
  const sortedGroupList = [...groupList].sort((a, b) => {
    if (b.year !== a.year) {
      return b.year - a.year; // 연도 내림차순
    }
    return a.order - b.order; // 같은 연도면 order 오름차순(1이 위)
  });
  const TableColGroup = () => (
    <colgroup>
      <col style={{ width: "5%" }} /> 
      <col style={{ width: "15%" }} />
      <col style={{ width: "35%" }} />
      <col style={{ width: "25%" }} />
      <col style={{ width: "10%" }} />
      <col style={{ width: "10%" }} />
    </colgroup>
  );

  // 아래는 네가 관리할 자기소개, 스테이트먼트 등 데이터
  const introductionEn = "My name is ... (영문 작가소개글)";
  const introductionKo = `초기 작업들은 주로 ‘유통’에 방점을 두고 그 이전과 이후 양상을 감각하려고 했다. 〈[셔츠와셔츠](#project:shirts)〉는 ‘베트남에서 만들어진 3만원짜리 유니클로 셔츠를 직접 만들면 얼마의 비용이 들까’라는 질문으로 시작됐다. 원단 구입, 패턴 제작, 베트남 현지에서패턴 조립 등 과정을 거치며 유니클로 셔츠 수십 벌을 살 수 있는 돈으로 한 벌의 모조 셔츠를 만들었다. 이 작품은 노동과 시간의 아이러니를 다룬 개인전 《죽은 시간 산 노동》(space UNION, 2017)에서 발표했다.  
  ‘유통’이라는 키워드는 《따뜻한 전쟁》(무악파출소, 2018)으로 이어지며 소비주의와 냉전의 잔재가 만날 때 벌어지는 양상을 다뤘다. 전시된 영상 작업〈허풍선이, 촌뜨기, 익살꾼〉은 북한 관련 이미지가 프린팅된 물건을 수입하는 과정에서 세관 사무소, 국정원, 세관의 퍼포먼스와 아이러니한 상황을 재구성한영상이다. 《따뜻한 전쟁》을 통해 분단의 감각이 생긴 이후, 2021년 동료들과 함께 콜렉티브 ‘분단이미지센터’를 결성했다. 분단이미지센터는 탈분단된 미래시점에 개관할 가상의 박물관 이름이다. 이 박물관은 분단 종식 이전에 생산된 이미지와 텍스트를 수집하고 전시하는데, 획일적인 분단 감각과 ‘평화통일’이라는 관점에서 벗어나 새로운 분단 이후의 가능성을 상상하며 활동을 이어가고 있다. 분단이미지센터의 첫 전시 《환영으로 채운 굴과 조각보로 기운 장벽 탐사대》(Hall1, 2021)에서 남파간첩 엄마에 대한 스토리텔링 게임을 설치작업〈와갈봉조선범_프로토타입〉으로 풀어냈다. 분단이미지센터가 주최한 포럼 〈분단이미지 진품명품〉(전태일기념관, 2022)에서는 가상의 북한물건 무역업체 투자설명회인 〈돌부채 투자설명회〉를 퍼포먼스 형태로 발표했다.  
  2021년 선택지 게임〈와갈봉조선범_베타테스트〉(바림/텐진야마 아트 스튜디오, 2021)를 만든 이후 기술에 대한 관심은 2024년 〈메이크 홈, 스위트홈〉(두산아트센터 Space111, 2024)과 워크숍〈바톤터치 디스토피아〉(아마도예술공간, 2024)로 이어진다. 워크숍〈바톤터치 디스토피아〉는 참여자들과 남・북한의 디스토피아 장면을 이미지 생성형 인공지능을 통해 다시 만들어보는 워크숍이었다. 워크숍〈바톤터치 디스토피아〉는 전시 《빛나는 도시, 어두운 황홀경》(SeMA벙커, 2024)에서 참여가능한 형태로 관객들에게 전시되었고, 같은 전시에서 크로마키 기술을 북송사업 피해자들의 인터뷰에 적용한 선택지게임〈96년 8개월의 크로마키〉를 함께 공개했다.  
  또한 2023년부터 다원예술 공연을 이어가고 있다. 분단이라는 조건에서 북한 이미지가 어떻게 유통되고 변형되는지 추적하는 다원예술 공연〈플레이홈, 스위트 홈〉(탈영역우정국, 2023)을 공개했다. 다음 해 인공지능의 한계와 남한의 지정학적 한계를 함께 다루며 다음 시리즈인 〈메이크 홈, 스위트 홈〉(두산아트센터 Space111, 2024)을 진행했다. 2024년 11월에는 한반도를 너머 동아시아 맥락에서 분단을 다루는 같은 시리즈 공연 〈이매진 홈, 스위트 홈〉을일본 삿포로 문화예술교류센터에서 선보였다. 2025년에는 DMZ에서 거래되는 부동산에 관한 작업과 다큐멘터리, 그리고 북중무역의 비공식적 루트를 추적하는 작업을 이어가고 있다.`;
  const statementEn = "This is my artist statement in English...";
  const statementKo = "이것은 내 아티스트 스테이트먼트입니다.";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
        aria-label="Close CV panel"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full w-full md:w-[70vw] max-w-5xl bg-[#222] z-50 shadow-2xl overflow-y-auto"
        style={{ willChange: "transform" }}
      >
        <button
          className="absolute top-6 right-6 text-3xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="max-w-5xl mx-auto py-16 px-14">
          {/* 탭 버튼 */}
          <div className="mb-4 flex gap-2">
            <button
              className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-lime-400 text-black' : 'bg-[#222] text-gray-400 border border-gray-700'}`}
              onClick={() => setLang('en')}
            >English</button>
            <button
              className={`px-3 py-1 rounded ${lang === 'ko' ? 'bg-lime-400 text-black' : 'bg-[#222] text-gray-400 border border-gray-700'}`}
              onClick={() => setLang('ko')}
            >한국어</button>
          </div>
          {/* 이름, 연락처, 지역 */}
          <div className="mb-6 text-white">
            <div className="font-bold">Jaeha Ban / 반재하</div>
            <div className="text-sm text-gray-400">banjaeha@gmail.com</div>
            <div className="text-sm text-gray-400">Seoul, Korea / 서울</div>
          </div>
          {/* 소개글 */}
          <div className="mb-8 whitespace-pre-line text-white text-base">
          <CustomMarkdown
            text={lang === 'en' ? introductionEn : introductionKo}
            setModalProjectId={setModalProjectId}
            />
          </div>
          {/* 스테이트먼트 */}
          <div className="mb-8 whitespace-pre-line text-white text-base">
          <CustomMarkdown
            text={lang === 'en' ? statementEn : statementKo}
            setModalProjectId={setModalProjectId}
            />
          </div>
          {/* Solo Shows & Projects */}
          <h2 className="text-lime-400 font-bold mt-8 mb-2 text-lg">Solo Shows & Projects</h2>
          <table className="w-full text-white text-sm mb-8">
          <TableColGroup />
            <tbody>
                {sortedSoloList.map(item => (
                <tr key={item.title_en + item.year}>
                    <td className="pr-1 py-1.5 align-top leading-tight">{item.year}</td>
                    <td className="pr-1 py-1.5 text-gray-400 font-normal align-top leading-tight">
                            {(lang === "en" ? item.category_en : item.category_ko) || ""}
                    </td>
                    <td className="font-bold pr-1 py-1.5 align-top leading-tight">
                        {lang === 'ko'
                            ? (
                            item.externalUrl ? (
                                <a
                                href={item.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                >
                                {item.type === "exhibition"
                                    ? <span>《{item.title_ko}》</span>
                                    : <span>〈{item.title_ko}〉</span>
                                }
                                </a>
                            ) : item.slug ? (
                                <Link href={item.slug} className="hover:underline">
                                {item.type === "exhibition"
                                    ? <span>《{item.title_ko}》</span>
                                    : <span>〈{item.title_ko}〉</span>
                                }
                                </Link>
                            ) : (
                                item.type === "exhibition"
                                ? <span>《{item.title_ko}》</span>
                                : <span>〈{item.title_ko}〉</span>
                            )
                            )
                            : (
                            item.externalUrl ? (
                                <a
                                href={item.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                >
                                <i>{item.title_en}</i>
                                </a>
                            ) : item.slug ? (
                                <Link href={item.slug} className="hover:underline">
                                <i>{item.title_en}</i>
                                </Link>
                            ) : (
                                <i>{item.title_en}</i>
                            )
                            )
                        }
                        </td>

                        <td className="pr-1 py-1.5 align-top leading-tight">
                        {item.placeUrl ? (
                            <a
                            href={item.placeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            >
                            {lang === 'en' ? item.place_en : item.place_ko}
                            </a>
                        ) : (
                            lang === 'en' ? item.place_en : item.place_ko
                        )}
                        </td>
                    <td className="pr-1 py-1.5 align-top leading-tight">
                    {lang === 'en' ? item.city_en : item.city_ko}
                    </td>
                    <td className="pr-1 py-1.5 align-top leading-tight">
                    {lang === 'en' ? item.country_en : item.country_ko}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
          {/* Group Shows & Projects */}
          <h2 className="text-lime-400 font-bold mt-8 mb-2 text-lg">Selected Group Shows & Projects</h2>
          <table className="w-full text-white text-sm">
          <TableColGroup />
            <tbody>
                {sortedGroupList.map(item => (
                <tr key={item.title_en + item.year}>
                    <td className="pr-1 py-1.5 align-top leading-tight">{item.year}</td>
                    <td className="pr-1 py-1.5 text-gray-400 font-normal align-top leading-tight">
                        {(lang === "en" ? item.category_en : item.category_ko) || ""}
                    </td>
                    <td className="font-bold pr-1 py-1.5 align-top leading-tight">
                        {lang === 'ko'
                            ? (
                            item.externalUrl ? (
                                <a
                                href={item.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                >
                                {item.type === "exhibition"
                                    ? <span>《{item.title_ko}》</span>
                                    : <span>〈{item.title_ko}〉</span>
                                }
                                </a>
                            ) : item.slug ? (
                                <Link href={item.slug} className="hover:underline">
                                {item.type === "exhibition"
                                    ? <span>《{item.title_ko}》</span>
                                    : <span>〈{item.title_ko}〉</span>
                                }
                                </Link>
                            ) : (
                                item.type === "exhibition"
                                ? <span>《{item.title_ko}》</span>
                                : <span>〈{item.title_ko}〉</span>
                            )
                            )
                            : (
                            item.externalUrl ? (
                                <a
                                href={item.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                >
                                <i>{item.title_en}</i>
                                </a>
                            ) : item.slug ? (
                                <Link href={item.slug} className="hover:underline">
                                <i>{item.title_en}</i>
                                </Link>
                            ) : (
                                <i>{item.title_en}</i>
                            )
                            )
                        }
                        </td>

                        <td className="pr-1 py-1.5 align-top leading-tight">
                        {item.placeUrl ? (
                            <a
                            href={item.placeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            >
                            {lang === 'en' ? item.place_en : item.place_ko}
                            </a>
                        ) : (
                            lang === 'en' ? item.place_en : item.place_ko
                        )}
                        </td>
                    <td className="pr-1 py-1.5 align-top leading-tight">
                    {lang === 'en' ? item.city_en : item.city_ko}
                    </td>
                    <td className="pr-1 py-1.5 align-top leading-tight">
                    {lang === 'en' ? item.country_en : item.country_ko}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </motion.div>
      {modalProjectId && (
            <ProjectModal
                id={modalProjectId}
                onClose={() => setModalProjectId(null)}
            />
            )}
    </>
  );
}
