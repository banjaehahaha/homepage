import React from "react";
import ReactMarkdown from "react-markdown";

type CustomMarkdownProps = {
    text: string;
    setModalProjectId: (id: string | null) => void;
    className?: string;
  };

export default function CustomMarkdown({
  text,
  setModalProjectId,
  className = "",
}: CustomMarkdownProps) {
  return (
    <div className={className}>
    <ReactMarkdown
      components={{
        a: ({ href, children, ...props }) => {
          // 1. #project:ID 형식은 모달 오픈
          if (href && href.startsWith("#project:")) {
            const id = href.replace("#project:", "");
            return (
              <button
                type="button"
                className="text-lime-400 cursor-pointer hover:underline"
                onClick={() => setModalProjectId(id)}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                {children}
              </button>
            );
          }
          // 2. 외부 링크
          if (href && href.startsWith("http")) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime-400 cursor-pointer hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          }
          // 3. 내부 일반 링크
          return (
            <a href={href} className="underline text-lime-400" {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
    </div>
  );
}
