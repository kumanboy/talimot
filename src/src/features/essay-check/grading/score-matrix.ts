import type { EssayCriterionScore } from "./types";

const SCORE_75_MATRIX: Readonly<Record<string, number>> = {
    "24": 75,
    "23.5": 74,
    "23": 73,
    "22.5": 72,
    "22": 71,
    "21.5": 70,
    "21": 69,
    "20.5": 68,
    "20": 67,
    "19.5": 66,
    "19": 65,
    "18.5": 64,
    "18": 63,
    "17.5": 62,
    "17": 61,
    "16.5": 60,
    "16": 59,
    "15.5": 58,
    "15": 57,
    "14.5": 56,
    "14": 55,
    "13.5": 54,
    "13": 53,
    "12.5": 52,
    "12": 51,
    "11.5": 50,
    "11": 49,
    "10.5": 48,
    "10": 47,
    "9.5": 46,
    "9": 45,
    "8.5": 44,
    "8": 43,
    "7.5": 42,
    "7": 41,
    "6.5": 40,
    "6": 39,
    "5.5": 38,
    "5": 37,
    "4.5": 36,
    "4": 35,
    "3.5": 34,
    "3": 33,
    "2.5": 32,
    "2": 31,
    "1.5": 30,
    "1": 29,
    "0.5": 28,
    "0": 0,
};

export function isAllowedCriterionScore(value: unknown): value is EssayCriterionScore {
    return value === 0 || value === 0.5 || value === 1 || value === 1.5 || value === 2;
}

export function toEssayScaledScore(rawScore: number): number {
    if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > 24 || rawScore * 2 !== Math.round(rawScore * 2)) {
        throw new Error(`Invalid essay raw score: ${rawScore}`);
    }

    const scaled = SCORE_75_MATRIX[String(rawScore)];
    if (scaled === undefined) {
        throw new Error(`Essay score is missing from 75-point matrix: ${rawScore}`);
    }

    return scaled;
}
