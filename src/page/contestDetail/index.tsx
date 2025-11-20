import * as S from "./styles";
// 문제 타입 정의
interface Problem {
  id: number;
  number: string;
  title: string;
  status: "submitted" | "not-submitted";
}

// 목업 데이터
const MOCK_PROBLEMS: Problem[] = [
  { id: 1, number: "01", title: "숫자야구", status: "not-submitted" },
  { id: 2, number: "02", title: "문자열과 알파벳 쿼리", status: "submitted" },
  { id: 3, number: "03", title: "문자열과 알파벳 쿼리", status: "submitted" },
  { id: 4, number: "04", title: "문자열과 알파벳 쿼리", status: "submitted" },
  {
    id: 5,
    number: "05",
    title: "문자열과 알파벳 쿼리",
    status: "not-submitted",
  },
  {
    id: 6,
    number: "06",
    title: "문자열과 알파벳 쿼리",
    status: "not-submitted",
  },
  { id: 7, number: "07", title: "문자열과 알파벳 쿼리", status: "submitted" },
  { id: 8, number: "08", title: "문자열과 알파벳 쿼리", status: "submitted" },
];

export const ContestDetailPage = () => {
  return (
    <>
      <S.Container>
        {/* Header */}
        <S.Header>
          <S.HeaderContent>
            <S.HeaderLeft>
              <S.LogoImage
                src="https://i.ibb.co/ycw6HTQF/image.png"
                alt="DUKKAEBI Logo"
              />
              <S.Nav>
                <S.NavItem $active={false}>문제풀기</S.NavItem>
                <S.NavItem $active={true}>알고리즘 대회</S.NavItem>
              </S.Nav>
            </S.HeaderLeft>
            <S.UserIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="#828282"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                />
              </svg>
            </S.UserIcon>
          </S.HeaderContent>
        </S.Header>

        {/* Contest Info Section */}
        <S.ContestInfoSection>
          <S.ContestInfoContent>
            {/* Contest Image */}
            <S.ContestImage
              src="https://i.ibb.co/bgdgkTBG/image.png"
              alt="DGSW 프로그래밍 대회"
            />

            {/* Contest Details */}
            <S.ContestDetails>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <S.ContestTitle>DGSW 프로그래밍 대회</S.ContestTitle>
                <S.ContestDescription>
                  <S.DescriptionText>
                    DGSW 프로그래밍 대회는 교육봉사 동아리 '두카미'에서 진행하는
                    <br />
                    알고리즘 대회 입니다.
                  </S.DescriptionText>
                  <S.ContestMeta>
                    2025.11.10 ~ 2025.11.14 ・100명 참여중
                  </S.ContestMeta>
                </S.ContestDescription>
              </div>

              {/* Progress Bar */}
              <S.ProgressSection>
                <S.ProgressBarContainer>
                  <S.ProgressBar progress={10} />
                </S.ProgressBarContainer>
                <S.ProgressText>10% 진행</S.ProgressText>
              </S.ProgressSection>
            </S.ContestDetails>
          </S.ContestInfoContent>
        </S.ContestInfoSection>

        {/* Main Content Area */}
        <S.MainContentArea>
          {/* Problems List */}
          <S.ProblemsSection>
            <S.ProblemsTable>
              {/* Table Header */}
              <S.TableHeader>
                <S.TableHeaderLeft>
                  <S.HeaderCell>번호</S.HeaderCell>
                  <S.HeaderCell>제목</S.HeaderCell>
                </S.TableHeaderLeft>
                <S.TableHeaderRight>
                  <S.HeaderCell>제출 상태</S.HeaderCell>
                </S.TableHeaderRight>
              </S.TableHeader>

              {/* Table Body */}
              <S.TableBody>
                {MOCK_PROBLEMS.map((problem, index) => (
                  <S.TableRow
                    key={problem.id}
                    $isLast={index === MOCK_PROBLEMS.length - 1}
                  >
                    <S.ProblemNumber>{problem.number}</S.ProblemNumber>
                    <S.ProblemTitle>{problem.title}</S.ProblemTitle>
                    <S.ProblemStatus $status={problem.status}>
                      {problem.status === "submitted" ? "제출 완료" : "미제출"}
                    </S.ProblemStatus>
                  </S.TableRow>
                ))}
              </S.TableBody>
            </S.ProblemsTable>
          </S.ProblemsSection>

          {/* Contest Info Card */}
          <S.ContestInfoCard>
            <S.CardContent>
              <S.CardInfo>
                <S.CardTitle>DGSW 프로그래밍 대회</S.CardTitle>
                <S.CardDetails>
                  <S.CardDetail>시작 일시 : 2025년 11월 14일 12:00</S.CardDetail>
                  <S.CardDetail>코딩 테스트 시간 : 30분</S.CardDetail>
                  <S.CardDetail>총 10문제</S.CardDetail>
                </S.CardDetails>
              </S.CardInfo>

              <S.StartButton>코딩테스트 시작하기</S.StartButton>
            </S.CardContent>
          </S.ContestInfoCard>
        </S.MainContentArea>
      </S.Container>
    </>
  );
};
