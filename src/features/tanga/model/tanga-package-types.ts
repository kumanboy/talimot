export type TangaPackageId =
    | "starter"
    | "standard"
    | "maximum";

export type TangaPackageDefinition = {
    readonly id: TangaPackageId;
    readonly name: string;
    readonly amount: number;
    readonly price: number;
    readonly badge?: string;
    readonly description: string;
    readonly recommended: boolean;
};
