"use client";

import type {
    TestOptionId,
    TestQuestion,
} from "@/features/tests/model/questions/spelling-type-1";

import styles from "./question-navigator.module.css";

type UserAnswers = Partial<
    Record<string, TestOptionId>
>;

type QuestionNavigatorProps = {
    isOpen: boolean;
    currentIndex: number;
    questions: readonly TestQuestion[];
    answers: UserAnswers;
    markedQuestionIds: ReadonlySet<string>;
    onCloseAction: () => void;
    onQuestionSelectAction: (
        index: number,
    ) => void;
    onFinishAction: () => void;
};

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="m7 7 10 10M17 7 7 17"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function QuestionNavigator({
                                      isOpen,
                                      currentIndex,
                                      questions,
                                      answers,
                                      markedQuestionIds,
                                      onCloseAction,
                                      onQuestionSelectAction,
                                      onFinishAction,
                                  }: QuestionNavigatorProps) {
    if (!isOpen) {
        return null;
    }

    const answeredCount =
        questions.filter((question) =>
            Boolean(answers[question.id]),
        ).length;

    const unansweredCount =
        questions.length - answeredCount;

    const markedCount =
        markedQuestionIds.size;

    return (
        <div
            className={styles.layer}
            role="presentation"
        >
            <button
                className={styles.overlay}
                type="button"
                aria-label="Savollar oynasini yopish"
                onClick={onCloseAction}
            />

            <section
                className={styles.sheet}
                role="dialog"
                aria-modal="true"
                aria-labelledby="question-navigator-title"
            >
                <div
                    className={styles.handle}
                    aria-hidden="true"
                />

                <header className={styles.header}>
                    <div>
                        <span>SAVOLLAR</span>

                        <h2 id="question-navigator-title">
                            Savollar navigatsiyasi
                        </h2>
                    </div>

                    <button
                        type="button"
                        aria-label="Savollar oynasini yopish"
                        onClick={onCloseAction}
                    >
                        <CloseIcon />
                    </button>
                </header>

                <div className={styles.stats}>
                    <div>
                        <strong>
                            {answeredCount}
                        </strong>

                        <span>
              Javob berilgan
            </span>
                    </div>

                    <div>
                        <strong>
                            {unansweredCount}
                        </strong>

                        <span>
              Javobsiz
            </span>
                    </div>

                    <div>
                        <strong>
                            {markedCount}
                        </strong>

                        <span>
              Belgilangan
            </span>
                    </div>
                </div>

                <div
                    className={styles.questionGrid}
                    aria-label="Savollar ro‘yxati"
                >
                    {questions.map(
                        (question, index) => {
                            const isCurrent =
                                index === currentIndex;

                            const isAnswered =
                                Boolean(
                                    answers[question.id],
                                );

                            const isMarked =
                                markedQuestionIds.has(
                                    question.id,
                                );

                            return (
                                <button
                                    key={question.id}
                                    className={[
                                        styles.questionButton,
                                        isAnswered
                                            ? styles.answered
                                            : "",
                                        isCurrent
                                            ? styles.current
                                            : "",
                                        isMarked
                                            ? styles.marked
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    type="button"
                                    aria-current={
                                        isCurrent
                                            ? "step"
                                            : undefined
                                    }
                                    aria-label={`${question.order}-savol${
                                        isAnswered
                                            ? ", javob berilgan"
                                            : ", javobsiz"
                                    }${
                                        isMarked
                                            ? ", belgilangan"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        onQuestionSelectAction(
                                            index,
                                        )
                                    }
                                >
                                    {question.order}

                                    {isMarked ? (
                                        <span
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </button>
                            );
                        },
                    )}
                </div>

                <div className={styles.legend}>
          <span>
            <i
                className={
                    styles.currentLegend
                }
            />
            Joriy
          </span>

                    <span>
            <i
                className={
                    styles.answeredLegend
                }
            />
            Javob berilgan
          </span>

                    <span>
            <i
                className={
                    styles.unansweredLegend
                }
            />
            Javobsiz
          </span>

                    <span>
            <i
                className={
                    styles.markedLegend
                }
            />
            Belgilangan
          </span>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onCloseAction}
                    >
                        Joriy savolga qaytish
                    </button>

                    <button
                        type="button"
                        onClick={onFinishAction}
                    >
                        Testni yakunlash
                    </button>
                </div>
            </section>
        </div>
    );
}