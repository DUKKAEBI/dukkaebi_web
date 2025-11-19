import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type * as monacoEditor from "monaco-editor";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import dubiAvatar from "../../assets/image/solve/Dubi.png";
import * as Style from "./style";

type SectionContent = {
  title: string;
  content: ReactNode;
};

type ProblemDetail = {
  name: string;
  description: string;
  input: string;
  output: string;
  exampleInput: string;
  exampleOutput: string;
};

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const PROBLEM_SECTIONS: SectionContent[] = [
  {
    title: "문제 설명",
    content: (
      <>
        N개의 정수가 주어졌을 때, 그 중 최댓값을 구하는 프로그램을 작성하시오.
      </>
    ),
  },
  {
    title: "입력:",
    content: (
      <>
        첫째 줄에 정수의 개수 N(1 ≤ N ≤ 100)이 주어진다.
        <br />
        둘째 줄에는 N개의 정수가 공백으로 구분되어 주어진다.
      </>
    ),
  },
  {
    title: "출력:",
    content: <>주어진 정수 중 최댓값을 출력한다.</>,
  },
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    text: "모르는 개념이 있다면 저 두비에게 물어보세요!",
  },
];

const FALLBACK_PROBLEM: ProblemDetail = {
  name: "최댓값 구하기",
  description: "N개의 정수가 주어졌을 때, 그 중 최댓값을 구하는 프로그램을 작성하시오.",
  input:
    "첫째 줄에 정수의 개수 N(1 ≤ N ≤ 100)이 주어진다.\n둘째 줄에는 N개의 정수가 공백으로 구분되어 주어진다.",
  output: "주어진 정수 중 최댓값을 출력한다.",
  exampleInput: "5\n1 7 3 9 2",
  exampleOutput: "9",
};

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== "string") return "";
  return raw.trim().replace(/\/?$/, "/");
})();

export default function SolvePage() {
  const { problemId } = useParams<{ problemId?: string }>();
  const [sampleInput, setSampleInput] = useState(FALLBACK_PROBLEM.exampleInput);
  const [sampleOutput, setSampleOutput] = useState(FALLBACK_PROBLEM.exampleOutput);
  const [terminalOutput, setTerminalOutput] = useState("실행 결과가 이곳에 표시됩니다.");
  const [code, setCode] = useState(``);
  const [rightPanelWidth, setRightPanelWidth] = useState(65);
  const [isResizing, setIsResizing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_CHAT_MESSAGES
  );
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [problemStatus, setProblemStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [problemError, setProblemError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(INITIAL_CHAT_MESSAGES.length);
  const botReplyTimeoutRef = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Terminal (floating) size & resize state
  const [terminalHeight, setTerminalHeight] = useState(200); // px
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const rightWidthPercent = ((rect.width - relativeX) / rect.width) * 100;
      const clampedWidth = Math.min(80, Math.max(20, rightWidthPercent));
      setRightPanelWidth(clampedWidth);
    };

    const stopResizing = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  useEffect(() => {
    const updateTerminalHeight = () => {
      if (!containerRef.current) return;
      const { height } = containerRef.current.getBoundingClientRect();
      const desiredHeight = Math.max(180, Math.min(height * 0.3, height - 160));
      setTerminalHeight(desiredHeight);
    };

    updateTerminalHeight();
    window.addEventListener("resize", updateTerminalHeight);
    return () => window.removeEventListener("resize", updateTerminalHeight);
  }, []);

  useEffect(() => {
    if (!problemId) {
      setProblem(null);
      setProblemStatus("idle");
      setProblemError("");
      setSampleInput(FALLBACK_PROBLEM.exampleInput);
      setSampleOutput(FALLBACK_PROBLEM.exampleOutput);
      return;
    }

    if (!API_BASE_URL) {
      setProblem(null);
      setProblemStatus("error");
      setProblemError("서버 주소가 설정되어 있지 않습니다. .env의 VITE_API_URL 값을 확인하세요.");
      return;
    }

    const controller = new AbortController();
    const fetchProblem = async () => {
      setProblemStatus("loading");
      setProblemError("");
      try {
        const response = await fetch(`${API_BASE_URL}problems/${problemId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("문제 정보를 불러오지 못했습니다.");
        }
        const data: ProblemDetail = await response.json();
        setProblem(data);
        setProblemStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setProblem(null);
        setProblemStatus("error");
        setProblemError(
          error instanceof Error
            ? error.message
            : "문제 정보를 가져오는 중 오류가 발생했습니다."
        );
        setSampleInput(FALLBACK_PROBLEM.exampleInput);
        setSampleOutput(FALLBACK_PROBLEM.exampleOutput);
      }
    };

    fetchProblem();
    return () => controller.abort();
  }, [problemId]);

  useEffect(() => {
    if (!problem) return;
    setSampleInput(problem.exampleInput || FALLBACK_PROBLEM.exampleInput);
    setSampleOutput(problem.exampleOutput || FALLBACK_PROBLEM.exampleOutput);
  }, [problem]);

  const handleCalculate = () => {
    const lines = sampleInput.trim().split("\n");
    if (lines.length < 2) {
      setTerminalOutput("입력 오류");
      return;
    }

    const numbers = lines[1].trim().split(/\s+/).map(Number);
    if (numbers.some(isNaN)) {
      setTerminalOutput("입력 오류");
      return;
    }

    const max = Math.max(...numbers);
    setTerminalOutput(max.toString());
  };

  const handleEditorBeforeMount = (monaco: typeof monacoEditor) => {
    monaco.editor.defineTheme("dukkaebi-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#263238",
        "editor.lineHighlightBackground": "#2f3a40",
      },
    });
  };

  useEffect(() => {
    if (!isChatOpen) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const handleChatInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChatInput(event.target.value);
  };

  const handleChatInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (event.nativeEvent.isComposing) {
        return;
      }
      event.preventDefault();
      handleChatSubmit();
    }
  };

  useEffect(
    () => () => {
      if (botReplyTimeoutRef.current) {
        window.clearTimeout(botReplyTimeoutRef.current);
      }
    },
    []
  );

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const trimmed = chatInput.trim();
    const nextUserId = messageIdRef.current + 1;
    const newUserMessage: ChatMessage = {
      id: nextUserId,
      sender: "user",
      text: trimmed,
    };
    messageIdRef.current = nextUserId;
    setMessages((prev) => [...prev, newUserMessage]);
    setChatInput("");

    if (botReplyTimeoutRef.current) {
      window.clearTimeout(botReplyTimeoutRef.current);
    }

    botReplyTimeoutRef.current = window.setTimeout(() => {
      const botId = messageIdRef.current + 1;
      const newBotMessage: ChatMessage = {
        id: botId,
        sender: "bot",
        text: `좋은 질문이에요! "${trimmed}"에 대해 곧 답을 준비할게요.`,
      };
      messageIdRef.current = botId;
      setMessages((prev) => [...prev, newBotMessage]);
      botReplyTimeoutRef.current = null;
    }, 600);
  };

  const problemSections = problem
    ? [
        { title: "문제 설명", content: problem.description },
        { title: "입력", content: problem.input },
        { title: "출력", content: problem.output },
      ]
    : PROBLEM_SECTIONS;

  const statusMessage =
    problemStatus === "loading"
      ? "문제를 불러오는 중입니다..."
      : problemStatus === "error"
      ? problemError || "문제를 불러오지 못했습니다."
      : !problemId
      ? "문제 ID가 없어 기본 예제를 보여줍니다."
      : "";

  return (
    <Style.SolveContainer ref={containerRef}>
      <Style.Header>
        <Style.BackButton>‹</Style.BackButton>
        <Style.HeaderTitle>{problem?.name ?? FALLBACK_PROBLEM.name}</Style.HeaderTitle>
      </Style.Header>

      <Style.PageContent>
        <Style.LeftPanel>
          <Style.LeftPanelContent>
            {statusMessage && (
              <Style.Section>
                <Style.SectionTitle>알림</Style.SectionTitle>
                <Style.ProblemStatus
                  $variant={problemStatus === "error" ? "error" : "info"}
                >
                  {statusMessage}
                </Style.ProblemStatus>
              </Style.Section>
            )}
            {problemSections.map(({ title, content }) => (
              <Style.Section key={title}>
                <Style.SectionTitle>{title}</Style.SectionTitle>
                <Style.SectionText>{content}</Style.SectionText>
              </Style.Section>
            ))}

            <Style.Section>
              <Style.SectionTitle>예시 입력:</Style.SectionTitle>
              <Style.ExampleTextarea
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                value={sampleInput}
              />
            </Style.Section>

            <Style.Section>
              <Style.SectionTitle>예시 출력:</Style.SectionTitle>
              <Style.ExampleOutput>{sampleOutput}</Style.ExampleOutput>
            </Style.Section>
          </Style.LeftPanelContent>
        </Style.LeftPanel>

        <Style.Divider
          onMouseDown={() => setIsResizing(true)}
          $isResizing={isResizing}
        />

        <Style.RightPanel $width={rightPanelWidth}>
          <Style.EditorContainer>
            <Editor
              height="100%"
              width="100%"
              language="python"
              value={code}
              onChange={(value) => setCode(value || "")}
              beforeMount={handleEditorBeforeMount}
              theme="dukkaebi-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 1.6,
                wordWrap: "on",
                tabSize: 2,
                scrollBeyondLastLine: false,
              }}
            />
          </Style.EditorContainer>

          <Style.ResultContainer>
            <Style.Terminal ref={terminalRef} $height={terminalHeight}>
              <Style.TerminalHandle />
              <Style.TerminalHeader>실행 결과</Style.TerminalHeader>
              <Style.TerminalOutput>{terminalOutput}</Style.TerminalOutput>
            </Style.Terminal>

            <Style.SubmitWrapper>
              <Style.SubmitButton onClick={handleCalculate}>
                제출 후 채점하기
              </Style.SubmitButton>
            </Style.SubmitWrapper>
          </Style.ResultContainer>
        </Style.RightPanel>
      </Style.PageContent>

      {isChatOpen ? (
        <Style.ChatModal>
          <Style.ChatModalHeader>
            <Style.ChatCloseButton
              type="button"
              aria-label="AI 챗봇 닫기"
              onClick={closeChat}
            >
              ×
            </Style.ChatCloseButton>
          </Style.ChatModalHeader>
          <Style.ChatModalBody>
            <Style.ChatMessages>
              {messages.map((message) => {
                const isUser = message.sender === "user";
                return (
                  <Style.ChatMessageRow key={message.id} $isUser={isUser}>
                    <Style.ChatMessageAvatar
                      src={dubiAvatar}
                      alt="두비"
                      $hidden={isUser}
                    />
                    <Style.ChatMessageBubble $isUser={isUser}>
                      {message.text}
                    </Style.ChatMessageBubble>
                  </Style.ChatMessageRow>
                );
              })}
              <div ref={chatEndRef} />
            </Style.ChatMessages>
          </Style.ChatModalBody>
          <Style.ChatInputWrapper>
            <Style.ChatInputContainer>
              <Style.ChatInput
                value={chatInput}
                placeholder="무엇이든 물어보세요"
                onChange={handleChatInputChange}
                onKeyDown={handleChatInputKeyDown}
              />
              <Style.ChatSendButton
                type="button"
                aria-label="메시지 보내기"
                onClick={handleChatSubmit}
                $active={Boolean(chatInput.trim())}
              >
                ↑
              </Style.ChatSendButton>
            </Style.ChatInputContainer>
          </Style.ChatInputWrapper>
        </Style.ChatModal>
      ) : (
        <Style.AIAssistantWrapper type="button" onClick={openChat}>
          <Style.AIAssistantAvatarWrapper>
            <Style.AIAssistantAvatar src={dubiAvatar} alt="두비" />
            <Style.AIAssistantLabel>AI 챗봇</Style.AIAssistantLabel>
          </Style.AIAssistantAvatarWrapper>
          <Style.AIAssistantBubble>
            모르겠다면 저에게 물어보세요!
          </Style.AIAssistantBubble>
        </Style.AIAssistantWrapper>
      )}
    </Style.SolveContainer>
  );
}
