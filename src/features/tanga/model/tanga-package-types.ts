export type TangaPackageId =
    | "starter"
    | "standard"
    | "maximum";

export type TangaPackageDefinition = {
    readonly id: TangaPackageId;
    readonly amount: number;
    readonly price: number;
    readonly badge?: string;
    readonly description: string;
    readonly recommended: boolean;
};
