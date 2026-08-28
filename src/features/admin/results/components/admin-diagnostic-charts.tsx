import type {
    AdminDiagnosticGradeBucket,
    AdminDiagnosticItemMetric,
} from "@/features/admin/results/server/get-diagnostic-analytics";

import styles from "./admin-diagnostic-analytics.module.css";

function safeMaximum(values: readonly number[], fallback = 1): number {
    const maximum = Math.max(...values, 0);
    return maximum > 0 ? maximum : fallback;
}

function niceCeiling(value: number): number {
    if (value <= 10) return Math.ceil(value);
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    const step = normalized <= 2 ? 0.5 : normalized <= 5 ? 1 : 2;
    return Math.ceil(normalized / step) * step * magnitude;
}

export function GradeDistributionChart({
    data,
}: {
    readonly data: readonly AdminDiagnosticGradeBucket[];
}) {
    const width = 820;
    const height = 340;
    const padding = { top: 34, right: 20, bottom: 58, left: 54 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maximum = niceCeiling(safeMaximum(data.map((item) => item.count)));
    const slotWidth = innerWidth / Math.max(data.length, 1);
    const barWidth = Math.min(62, slotWidth * 0.62);

    return (
        <svg
            className={styles.chartSvg}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Foydalanuvchilar darajasi bo‘yicha taqsimot"
        >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const value = Math.round(maximum * ratio);
                const y = padding.top + innerHeight - innerHeight * ratio;
                return (
                    <g key={ratio}>
                        <line
                            className={styles.gridLine}
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={y}
                            y2={y}
                        />
                        <text className={styles.axisText} x={padding.left - 10} y={y + 4} textAnchor="end">
                            {value}
                        </text>
                    </g>
                );
            })}

            {data.map((item, index) => {
                const barHeight = maximum > 0 ? (item.count / maximum) * innerHeight : 0;
                const x = padding.left + slotWidth * index + (slotWidth - barWidth) / 2;
                const y = padding.top + innerHeight - barHeight;
                return (
                    <g key={item.key}>
                        <rect
                            className={styles.brandBar}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx={9}
                        >
                            <title>{`${item.label}: ${item.count} foydalanuvchi`}</title>
                        </rect>
                        <text
                            className={styles.valueText}
                            x={x + barWidth / 2}
                            y={Math.max(padding.top + 12, y - 8)}
                            textAnchor="middle"
                        >
                            {item.count}
                        </text>
                        <text
                            className={styles.labelText}
                            x={x + barWidth / 2}
                            y={height - 25}
                            textAnchor="middle"
                        >
                            {item.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export function CorrectAnswersChart({
    data,
}: {
    readonly data: readonly AdminDiagnosticItemMetric[];
}) {
    const width = Math.max(1180, data.length * 49 + 90);
    const height = 390;
    const padding = { top: 46, right: 24, bottom: 60, left: 58 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maximum = niceCeiling(safeMaximum(data.map((item) => item.respondentCount)));
    const slotWidth = innerWidth / Math.max(data.length, 1);
    const barWidth = Math.min(31, slotWidth * 0.68);

    return (
        <svg
            className={styles.wideChartSvg}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Har bir diagnostika savoli bo‘yicha to‘g‘ri javoblar soni"
        >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const value = Math.round(maximum * ratio);
                const y = padding.top + innerHeight - innerHeight * ratio;
                return (
                    <g key={ratio}>
                        <line
                            className={styles.gridLine}
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={y}
                            y2={y}
                        />
                        <text className={styles.axisText} x={padding.left - 10} y={y + 4} textAnchor="end">
                            {value}
                        </text>
                    </g>
                );
            })}

            {data.map((item, index) => {
                const barHeight = maximum > 0 ? (item.correctCount / maximum) * innerHeight : 0;
                const x = padding.left + slotWidth * index + (slotWidth - barWidth) / 2;
                const y = padding.top + innerHeight - barHeight;
                return (
                    <g key={item.itemKey}>
                        <rect
                            className={styles.correctBar}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx={6}
                        >
                            <title>
                                {`${item.itemKey}-savol: ${item.correctCount}/${item.respondentCount} to‘g‘ri (${item.correctRate.toFixed(1)}%)`}
                            </title>
                        </rect>
                        <text
                            className={styles.compactValueText}
                            x={x + barWidth / 2}
                            y={Math.max(padding.top + 11, y - 7)}
                            textAnchor="middle"
                        >
                            {item.correctCount}
                        </text>
                        <text
                            className={styles.labelText}
                            x={x + barWidth / 2}
                            y={height - 27}
                            textAnchor="middle"
                        >
                            {item.itemKey}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export function RaschDifficultyChart({
    data,
}: {
    readonly data: readonly AdminDiagnosticItemMetric[];
}) {
    const width = Math.max(1180, data.length * 49 + 90);
    const height = 430;
    const padding = { top: 42, right: 24, bottom: 64, left: 58 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maxAbsolute = Math.max(
        1,
        ...data.map((item) => Math.abs(item.raschDifficulty)),
    );
    const domain = Math.min(5, Math.ceil(maxAbsolute * 2) / 2);
    const slotWidth = innerWidth / Math.max(data.length, 1);
    const barWidth = Math.min(28, slotWidth * 0.62);
    const yFor = (value: number) =>
        padding.top + ((domain - value) / (domain * 2)) * innerHeight;
    const zeroY = yFor(0);

    const ticks = [-domain, -domain / 2, 0, domain / 2, domain];

    return (
        <svg
            className={styles.wideChartSvg}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Rasch 1PL bo‘yicha savollar qiyinlik logitlari"
        >
            {ticks.map((tick) => {
                const y = yFor(tick);
                return (
                    <g key={tick}>
                        <line
                            className={tick === 0 ? styles.zeroLine : styles.gridLine}
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={y}
                            y2={y}
                        />
                        <text className={styles.axisText} x={padding.left - 10} y={y + 4} textAnchor="end">
                            {tick.toFixed(1)}
                        </text>
                    </g>
                );
            })}

            {data.map((item, index) => {
                const itemY = yFor(item.raschDifficulty);
                const x = padding.left + slotWidth * index + (slotWidth - barWidth) / 2;
                const y = Math.min(zeroY, itemY);
                const barHeight = Math.max(2, Math.abs(itemY - zeroY));
                const positive = item.raschDifficulty >= 0;
                const labelY = positive
                    ? Math.max(padding.top + 12, itemY - 8)
                    : Math.min(height - padding.bottom - 5, itemY + 17);

                return (
                    <g key={item.itemKey}>
                        <rect
                            className={positive ? styles.raschHardBar : styles.raschEasyBar}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx={5}
                        >
                            <title>
                                {`${item.itemKey}-savol: qiyinlik ${item.raschDifficulty.toFixed(2)} logit, to‘g‘ri ${item.correctRate.toFixed(1)}%`}
                            </title>
                        </rect>
                        <text
                            className={styles.compactValueText}
                            x={x + barWidth / 2}
                            y={labelY}
                            textAnchor="middle"
                        >
                            {item.raschDifficulty.toFixed(2)}
                        </text>
                        <text
                            className={styles.labelText}
                            x={x + barWidth / 2}
                            y={height - 29}
                            textAnchor="middle"
                        >
                            {item.itemKey}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
