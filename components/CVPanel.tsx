"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import CustomMarkdown from "@/components/CustomMarkdown";
import { soloList, groupList } from "@/components/cvList";
import Link from "next/link";
import ProjectModal from "@/projects/ProjectModal";

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, [breakpoint]);
    return isMobile;
  }

export default function CVPanel({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  console.log("isMobile:", isMobile);

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
  const introductionEn = `
  My early work focused on the notion of “distribution,” seeking to sense the realities that unfold both before and after the flows of goods, images, and systems. The project [*Shirts and Shirts*](#project:shirts) began with a deceptively simple question: How much would it cost to make a ₩30,000 Uniqlo shirt—manufactured in Vietnam—by hand? The process took me through sourcing fabric, creating patterns, and assembling the pieces in Vietnam, only to discover that the money spent on a single imitation shirt could have purchased dozens of Uniqlo originals. This work, shown in the solo exhibition *Dead Time Living Labor* (space UNION, 2017), explored the irony of labor and time in a globalized production chain.  
  The keyword of “distribution” continued in my exhibition *Warm War* (Art Mooak, 2018), where I examined the collision of consumerism and Cold War legacies. In the video work [*Alazon, Agroikos, Bomolochos*](#project:alazon), I reconstructed the ironic and often absurd performances staged by customs officials and intelligence agencies as I attempted to import objects printed with North Korean imagery. The experience of this project sharpened my sensitivity to the sensory dimension of division, leading me to co-found the collective [*Image Center of Divided Korea*](https://afterdivision.center) in 2021—a fictional museum set in a post-division future. The Center collects and exhibits images and texts produced before the end of Korea’s division, operating outside the conventional frameworks of “reunification” or standardized sentiment. Our first exhibition, *The expedition for a cave filled with illusions and a barrier stitched with patchwork* (Hall 1, 2021), I presented the storytelling installation game [*Wagalbongjoseonbeom-Prototype*](#project:wagalbong-prototype), which allowed visitors to experience and reconstruct the narrative of a North Korean spy mother, navigating the complex and often contradictory realities of division. In 2022, we organized the forum *Division Images : True or False* (Chuntaeil Memorial), and staged a performance, [*Dol-Bu-Chae Investor Relations*](#project:dol-bu-chae), as a fictional North Korean trading company pitch.  
  Since creating the interactive game [*Wagalbongjoseonbeom2_Beta Test*](#project:wagalbong-beta) (Barim/Tenjinyama Art Studio, 2021), my interest in technology has become increasingly central. In 2024, I developed the project [*MAKE HOME, SWEET HOME*](#project:make-home) (Doosan Art Center Space111), as well as the workshop [*Baton Touch Dystopia*](#project:baton-touch) (Amado Art Space, 2024), in which participants collectively recreated dystopian scenes from North and South Korea using AI image generators. This workshop was presented in the exhibition *The Radiant City, Dark Rapture―Dystopic Images of the Modern City*(SeMA Bunker, 2024), alongside the game-based work [*Chromakeys of 96 years and 8 months*](#project:chromakeys), in which chroma key technology was used as a visual device for the testimonies of North Korean repatriation victims.  
  Since 2023, I have expanded my practice into multidisciplinary performance, tracing how images of North Korea are circulated and transformed under the condition of division. [*PLAY HOME, SWEET HOME*](#project:play-home) (Post Territory Ujeongguk, 2023) was followed by [*MAKE HOME, SWEET HOME*](#project:make-home) (Doosan Art Center Space111, 2024), which probed the limits of artificial intelligence and the geopolitical impasses of South Korea. In November 2024, [*IMAGINE HOME, SWEET HOME*](#project:imagine-home) was presented at the Sapporo Cultural Arts Community Center SCARTS, situating the question of division within a wider East Asian context. In 2025, I am continuing work on real estate transactions in the DMZ, documentary practices, and tracing the unofficial routes of Sino-North Korean trade.`;
  const introductionKo = `초기 작업들은 주로 ‘유통’에 방점을 두고 그 이전과 이후 양상을 감각하려고 했다. 〈[셔츠와셔츠](#project:shirts)〉는 ‘베트남에서 만들어진 3만원짜리 유니클로 셔츠를 직접 만들면 얼마의 비용이 들까’라는 질문으로 시작됐다. 원단 구입, 패턴 제작, 베트남 현지에서패턴 조립 등 과정을 거치며 유니클로 셔츠 수십 벌을 살 수 있는 돈으로 한 벌의 모조 셔츠를 만들었다. 이 작품은 노동과 시간의 아이러니를 다룬 개인전 《죽은 시간 산 노동》(space UNION, 2017)에서 발표했다.  
  ‘유통’이라는 키워드는 《따뜻한 전쟁》(무악파출소, 2018)으로 이어지며 소비주의와 냉전의 잔재가 만날 때 벌어지는 양상을 다뤘다. 전시된 영상 작업〈[허풍선이, 촌뜨기, 익살꾼](#project:alazon)〉은 북한 관련 이미지가 프린팅된 물건을 수입하는 과정에서 세관 사무소, 국정원, 세관의 퍼포먼스와 아이러니한 상황을 재구성한영상이다. 《따뜻한 전쟁》을 통해 분단의 감각이 생긴 이후, 2021년 동료들과 함께 콜렉티브 ‘분단이미지센터’를 결성했다. [분단이미지센터](https://afterdivision.center)는 탈분단된 미래시점에 개관할 가상의 박물관 이름이다. 이 박물관은 분단 종식 이전에 생산된 이미지와 텍스트를 수집하고 전시하는데, 획일적인 분단 감각과 ‘평화통일’이라는 관점에서 벗어나 새로운 분단 이후의 가능성을 상상하며 활동을 이어가고 있다. 분단이미지센터의 첫 전시 《환영으로 채운 굴과 조각보로 기운 장벽 탐사대》(Hall1, 2021)에서 남파간첩 엄마에 대한 스토리텔링 게임을 설치작업〈[와갈봉조선범_프로토타입](#project:wagalbong-prototype)〉으로 풀어냈다. 분단이미지센터가 주최한 포럼 〈분단이미지 진품명품〉(전태일기념관, 2022)에서는 가상의 북한물건 무역업체 투자설명회인 〈[돌부채 투자설명회](#project:dol-bu-chae)〉를 퍼포먼스 형태로 발표했다.  
  2021년 선택지 게임〈[와갈봉조선범2_베타테스트](#project:wagalbong-beta)〉(바림/텐진야마 아트 스튜디오, 2021)를 만든 이후 기술에 대한 관심은 2024년 〈[메이크 홈, 스위트홈](#project:make-home)〉(두산아트센터 Space111, 2024)과 워크숍〈[바톤터치 디스토피아](#project:baton-touch)〉(아마도예술공간, 2024)로 이어진다. 워크숍〈[바톤터치 디스토피아](#project:baton-touch)〉는 참여자들과 남・북한의 디스토피아 장면을 이미지 생성형 인공지능을 통해 다시 만들어보는 워크숍이었다. 워크숍〈[바톤터치 디스토피아](#project:baton-touch)〉는 전시 《빛나는 도시, 어두운 황홀경》(SeMA벙커, 2024)에서 참여가능한 형태로 관객들에게 전시되었고, 같은 전시에서 크로마키 기술을 북송사업 피해자들의 인터뷰에 적용한 선택지게임〈[96년 8개월의 크로마키](#project:chromakeys)〉를 함께 공개했다.  
  또한 2023년부터 다원예술 공연을 이어가고 있다. 분단이라는 조건에서 북한 이미지가 어떻게 유통되고 변형되는지 추적하는 다원예술 공연〈[플레이홈, 스위트 홈](#project:play-home)〉(탈영역우정국, 2023)을 공개했다. 다음 해 인공지능의 한계와 남한의 지정학적 한계를 함께 다루며 다음 시리즈인 〈[메이크 홈, 스위트 홈](#project:make-home)〉(두산아트센터 Space111, 2024)을 진행했다. 2024년 11월에는 한반도를 너머 동아시아 맥락에서 분단을 다루는 같은 시리즈 공연 〈[이매진 홈, 스위트 홈](#project:imagine-home)〉을 일본 삿포로 문화예술교류센터에서 선보였다. 2025년에는 DMZ에서 거래되는 부동산에 관한 작업과 다큐멘터리, 그리고 북중무역의 비공식적 루트를 추적하는 작업을 이어가고 있다.`;
  const statementEn = `My work captures moments where the logic of systems fails to operate as intended in real life. I trace how constructs like borders, the Cold War, and industrial frameworks can misalign in personal experiences, trivial events, and everyday objects, and use these gaps to pose questions. To explore systems that extend beyond the individual, I focus on three main themes: distribution, technology, and division. Distribution and technology let me examine global and contemporary flows, while division represents the local and asynchronous circumstances unique to the Korean Peninsula. I aim to reveal how the global and the local, as well as synchronous and asynchronous conditions, interact and overlap.  
  I constantly ask myself what it means to make art in a world shaped by universal logic. We are rarely free from this logic, whether in consumption or daily life. This logic appears as the pursuit of efficiency—where time spent without obvious gain feels wasted—as well as in neoliberal self-exploitation and a kind of anti-communist self-censorship or ridicule toward North Korean content. These patterns become second nature, shaping perception and enabling efficient governance. Yet, sometimes the universal logic breaks down in reality. When what is internalized collides with what is actually in front of me—when there is a gap between the universal and the real—that is where my research begins.  
  All of my projects begin with research. Research, for me, is a method for escaping the dominance of singular values; it’s a way to venture outside the boundaries of the regime I inhabit. The questions that shape this process are layered: What triggered the breakdown? What are its components? Who governs, and how do individual lives and capacities shift within these systems? This chain of questions provides the structure for my work, becoming both metaphor and direct representation of systemic malfunction.  
  My sense for the “malfunction” of division first developed while working on [*Alazon, Agroikos, Bomolochos*](#project:alazon) (2018–2019). This video reconstructed the performance of customs officials and intelligence agents as I imported objects printed with North Korean imagery. The work focused on the irony that images treated as “kitsch” and “hip” in the US become contraband in South Korea, subject to 55 days of censorship—yet, in the end, the supposedly controlled goods entered the country without issue, exposing the performative nature of the censorship system.  
  For generations raised on pop culture, consumerism, and freedom of expression, division may feel remote and outdated. Yet even for millennials, its effects persist. For example, in the simulation game [*Civilization*], South Korean players routinely place troops on the border—a gesture that, in North America or Europe, would be seen as a military threat. But having grown up with the 38th parallel as the only border, they do this even when not intending conflict.  
  There’s no fixed method for representing these breakdowns, but I often use technology as a medium. Using technology is not about simply showcasing contemporary tools. If division brings out the asynchrony of our present, technology manifests the synchrony. I appropriate technology to highlight these dynamics. For instance, in the performance [*MAKE HOME, SWEET HOME*](#project:make-home) (2024), I used generative AI, which—due to lack of data—produces inaccurate images of North Korea. These images are not mere mistakes, but visual evidence of South Korea’s geopolitical and geographical limits. I leverage these limits and gaps not to argue for a technological dystopia, but to reveal the social and political relations at play and to show technology not just as a tool, but as an active agent within systems.  
  Ideologies of the new Cold War and the logic of efficiency shape our perceptions. Through art, I aim to reconfigure these senses. By working with distribution, technology, and division, I try to make visible the contemporary experience of South Koreans, creating space to rethink and re-feel the systems that shape us.`;
  const statementKo = `나의 작업은 시스템의 논리가 현실에서 오작동하는 것을 포착한다. 개인적 체험, 사소한 사건, 일상적 사물에서 국경이나 냉전, 산업 같은 시스템이 어떻게 어긋나는지 추적하며 질문을 던진다. 개인을 초과하는 시스템을 탐구하기 위해 주로 다룬 키워드는 ‘유통’, ‘기술’과 ‘분단’이다. 유통과 기술에서 전지구적/동시대적인 흐름을 파악한다면, 분단은 한반도라는 국지적/비동시적인 요소를 파악한다. 전지구적인 것과 국지적인 것을 오가며 비동시적인 것의 동시성을 포착하는 데에 작업의 목적을 둔다.  
  보편의 논리가 지배하는 세상에서 작업을 한다는 것은 어떤 의미일까? 상품을 소비하는 것부터 일상을 살아가는 데까지 지배의 논리에서 자유로울 수 없다. 돈이 되지 않거나 다른 이익이 없는데 시간을 쓰면 낭비처럼 느껴지는 효율성의 추구, ‘갓생’류의 신자유주의적 자기착취, 북한 관련 콘텐츠를 볼 때 비웃게 되거나 자기 검열을 하게 되는 반공주의 등이 그것이다. 보편의 논리는 습속이 되어 사회구성원의 감각을 규정하고 효율적인 통치의 수단이 된다. 그런데 그 보편적인 것은 가끔 현실에 오작동한다. 우리에게 내재된 것이 눈앞의 현실과 어긋날 때, 그러니까 보편적인 것과 현실에 오차가 생길 때 나는 작업의 리서치를 시작한다.  
  나의 모든 작업은 리서치에서 시작된다. 리서치는 보편의 논리가 지배하는, 하나의 단일한 삶의 가치를 벗어나기 위한 방법론이다. 내가 갇혀있는 레짐의 바깥을 탐험하는 과정이다. 리서치의 질문은 여러 층위로 나뉜다. 오작동의 계기는 무엇이었고 구성 요소는 어떻게 되는지, 통치의 주체는 누구였고, 그 안에서 개인의 삶이 어떤 흐름을 지나왔고 어떤 역량을 가지고 있었는지. 이런 꼬리에 꼬리를 물고 늘어지는 질문은 작업의 구조가 되어 보이지 않고 들리지 않던 오작동의 비유이자 직유가 된다.  
  내게 분단에 대한 오작동의 감각이 생긴 건 2018~2019년 작업한 〈[허풍선이, 촌뜨기, 익살꾼](#project:alazon)〉이라는 제목의 작업을 하면서부터이다. 〈[허풍선이, 촌뜨기, 익살꾼](#project:alazon)〉은 북한 관련 이미지가 프린팅된 물건을 수입하는 과정에서 세관 사무소, 국정원, 세관의 퍼포먼스를 재구성한 영상이다. 〈[허풍선이, 촌뜨기, 익살꾼](#project:alazon)〉은 미국 청년들에게 ‘키치’하고 ‘힙’한 기호로 사용되는 북한 프로파간다 이미지가 남한이라는 무대에 들어온 순간 이적 표현물이 되는 아이러니를 다뤘다. 해외 쇼핑몰에서 북한 이미지가 새겨진 물품들을 주문하면서 55일간 검열 과정을 겪었다. 하지만 통관보류 물품들이 제대로 관리되지 않고 통관 되면서 이 모든 검열 과정이 일종의 퍼포먼스였음이 드러났다.  
  대중문화와 소비주의, 표현의 자유 속에서 자란 밀레니얼 이후 세대에게 분단은 낯설고 고루한 소재이지만 그들 또한 분단의 자장 안에서 벗어나지 못한다. 한 예로, 국가 운영전략 시뮬레이션 게임인 〈문명〉에서 남한의 플레이어들이 자주 하는 실수가 있다. 바로 군대를 국경에 배치하는 것이다. 실제 북미/유럽 등 서방 국가에서 이런 행위는 선전포고 내지 군사적 위협으로 받아들인다. 밀레니얼 이후 세대 또한 38선이 유일한 국경인 남한에서 자랐기 때문에 게임 속에서 전투를 원하지 않더라도 자연스럽게 군대를 접경지역에 배치하게 되는 것이다.  
  오작동의 구조를 나타내는 방법이 고정되어 있지 않지만, 나는 작업에서 기술을 자주 사용한다. 이때 기술을 쓴다는 것은 동시대 기술을 선보이기 위한 것이 아니다. 분단이라는 키워드가 동시대의 비동시성을 드러낼 수 있다면 기술은 동시대의 동시성을 드러낼 수 있는 수단이 된다. 매체로서 기술을 작업에 전유하는 것이다. 한 예로, 다원예술 공연 〈[메이크 홈, 스위트 홈](#project:make-home)〉에서 이미지 생성형 인공지능을 사용했는데, 전지구적 연산으로서 인공지능은 학습데이터가 부족한 북한에 대해 부정확한 이미지를 도출할 수밖에 없다. 하지만 작업 안에서 이런 이미지는 단순히 부정확한 이미지가 아닌, ‘남한’의 정치적・지리적 한계를 담은 시각적 결과물이 된다. 기술이 가지고 있는 한계와 허점을 역이용하지만, 기술 내부에만 집중하는 기술 디스토피아주의를 주장하는 것은 아니다. 기술이 작동하는 사회정치적 관계를 드러내며, 기술은 수단일 뿐 아니라 이 세상을 능동적으로 규정하는 하나의 행위자임을 드러낸다. 시스템과 결부되어 작동하는 기술의 문제를 다루는 것은 오늘날 ‘오작동’을 포착하는 핵심적인 영역이다.  
  신냉전 이데올로기, 효율성의 논리 등, 우리는 시스템이 정해준대로 인식하기 쉽다. 하지만 우리는 미술을 통해 감각을 재구성할 수 있다. 유통과 기술, 그리고 분단이라는 키워드를 통해 지금 남한 국적의 사람이 겪는 감각을 가시화하고, 전지구적인 것과 국지적인 것, 동시대적인 것과 비동시대적인 것을 오가며 시스템을 재감각할 수 있는 계기를 만들고자 한다.`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
        aria-label="Close CV panel"
      />
      <motion.div
        initial={isMobile ? false : { x: '100%' }}
        animate={{ x: 0 }}
        exit={isMobile ? undefined : { x: '100%' }}
        transition={isMobile ? { duration: 0 } : { duration: 0.5, ease: "easeInOut" }}
        className="fixed top-0 right-0 w-full md:w-[70vw] max-w-5xl bg-[#222] z-50 shadow-2xl overflow-y-auto pb-20 md:pb-0 [height:calc(100vh-40px)] md:h-full [bottom:40px] md:bottom-0 rounded-t-xl"
        style={{
            willChange: "transform"
        }}
        onClick={e => e.stopPropagation()}
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
            <div className="text-sm text-gray-400">banjaehavana@gmail.com</div>
            <div className="text-sm text-gray-400">Seoul, Korea / 서울</div>
          </div>
          {/* 소개글 */}
          <h2 className="font-bold mt-8 mb-2 text-lg underline">Practice</h2>
          <div className="mb-8 whitespace-pre-line text-white text-base">
          <CustomMarkdown
            text={lang === 'en' ? introductionEn : introductionKo}
            setModalProjectId={setModalProjectId}
            />
          </div>
          {/* 스테이트먼트 */}
          <h2 className="font-bold mt-8 mb-2 text-lg underline">Approach</h2>
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
